import { PNode } from '@/types/pnode';
import jsPDF from 'jspdf';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function exportToCSV(nodes: PNode[], filename: string = 'pnodes-export.csv') {
  const headers = [
    'Node ID',
    'IP Address',
    'Status',
    'Latency (ms)',
    'Uptime (%)',
    'Health Score',
    'Storage Used (GB)',
    'Storage Committed (GB)',
    'Storage Usage (%)',
    'Version',
    'Credits',
    'Rank',
    'Is Public',
    'Is Seed',
    'Country',
    'City',
    'Last Seen'
  ];

  const rows = nodes.map(node => [
    node.id,
    node.ip,
    node.status,
    node.metrics.latency,
    node.metrics.uptime.toFixed(2),
    node.health.total,
    (node.storage.used / (1024 ** 3)).toFixed(2),
    (node.storage.committed / (1024 ** 3)).toFixed(2),
    node.storage.usagePercent.toFixed(2),
    node.version || 'N/A',
    node.credits || 0,
    node.rank || 0,
    node.isPublic ? 'Yes' : 'No',
    node.isSeed ? 'Yes' : 'No',
    node.geo?.country || 'Unknown',
    node.geo?.city || 'Unknown',
    node.metrics.lastSeen
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

export function exportToJSON(nodes: PNode[], filename: string = 'pnodes-export.json') {
  const jsonContent = JSON.stringify(nodes, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

export function exportSummaryToJSON(nodes: PNode[], filename: string = 'network-summary.json') {
  const summary = {
    timestamp: new Date().toISOString(),
    totalNodes: nodes.length,
    onlineNodes: nodes.filter(n => n.status === 'online').length,
    offlineNodes: nodes.filter(n => n.status === 'offline').length,
    unstableNodes: nodes.filter(n => n.status === 'unstable').length,
    averageLatency: nodes.reduce((sum, n) => sum + n.metrics.latency, 0) / nodes.length,
    averageUptime: nodes.reduce((sum, n) => sum + n.metrics.uptime, 0) / nodes.length,
    averageHealth: nodes.reduce((sum, n) => sum + n.health.total, 0) / nodes.length,
    totalStorage: nodes.reduce((sum, n) => sum + n.storage.used, 0),
    totalCapacity: nodes.reduce((sum, n) => sum + n.storage.committed, 0),
    topNodes: nodes.slice(0, 10).map(n => ({
      id: n.id,
      rank: n.rank,
      health: n.health.total,
      credits: n.credits
    })),
    geographicDistribution: getGeographicDistribution(nodes)
  };

  const jsonContent = JSON.stringify(summary, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

export function exportSummaryToPDF(nodes: PNode[], filename: string = 'network-summary.pdf') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFillColor(59, 130, 246); // Blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Xandeum Network Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  let yPos = 55;
  
  // Network Overview
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Network Overview', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const onlineNodes = nodes.filter(n => n.status === 'online').length;
  const offlineNodes = nodes.filter(n => n.status === 'offline').length;
  const unstableNodes = nodes.filter(n => n.status === 'unstable').length;
  const avgLatency = nodes.reduce((sum, n) => sum + n.metrics.latency, 0) / nodes.length;
  const avgUptime = nodes.reduce((sum, n) => sum + n.metrics.uptime, 0) / nodes.length;
  const avgHealth = nodes.reduce((sum, n) => sum + n.health.total, 0) / nodes.length;
  const totalStorage = nodes.reduce((sum, n) => sum + n.storage.used, 0);
  const totalCapacity = nodes.reduce((sum, n) => sum + n.storage.committed, 0);
  
  const stats = [
    `Total Nodes: ${nodes.length}`,
    `Online: ${onlineNodes} | Offline: ${offlineNodes} | Unstable: ${unstableNodes}`,
    `Average Latency: ${avgLatency.toFixed(2)}ms`,
    `Average Uptime: ${avgUptime.toFixed(2)}%`,
    `Average Health Score: ${avgHealth.toFixed(2)}/100`,
    `Total Storage Used: ${formatBytes(totalStorage)}`,
    `Total Capacity: ${formatBytes(totalCapacity)}`,
    `Storage Utilization: ${((totalStorage / totalCapacity) * 100).toFixed(2)}%`
  ];
  
  stats.forEach(stat => {
    doc.text(stat, 25, yPos);
    yPos += 7;
  });
  
  yPos += 5;
  
  // Top 10 Nodes
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 10 Nodes by Credits', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Rank', 25, yPos);
  doc.text('Node ID', 45, yPos);
  doc.text('Health', 120, yPos);
  doc.text('Credits', 150, yPos);
  doc.text('Status', 175, yPos);
  yPos += 5;
  
  doc.setFont('helvetica', 'normal');
  
  nodes.slice(0, 10).forEach((node, idx) => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(`#${idx + 1}`, 25, yPos);
    doc.text(node.id.substring(0, 20) + '...', 45, yPos);
    doc.text(node.health.total.toString(), 120, yPos);
    doc.text((node.credits || 0).toString(), 150, yPos);
    doc.text(node.status.toUpperCase(), 175, yPos);
    yPos += 6;
  });
  
  yPos += 10;
  
  // Geographic Distribution
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Geographic Distribution', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const geoDistribution = getGeographicDistribution(nodes);
  const topCountries = Object.entries(geoDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  topCountries.forEach(([country, count]) => {
    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`${country}: ${count} nodes`, 25, yPos);
    yPos += 7;
  });
  
  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Xandeum Network Observer - Real-time pNode Analytics', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Page 1 of ${doc.getNumberOfPages()}`, pageWidth - 20, footerY, { align: 'right' });
  
  // Save
  doc.save(filename);
}

function getGeographicDistribution(nodes: PNode[]) {
  const distribution: Record<string, number> = {};
  nodes.forEach(node => {
    const country = node.geo?.country || 'Unknown';
    distribution[country] = (distribution[country] || 0) + 1;
  });
  return distribution;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
