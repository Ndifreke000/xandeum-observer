# Advanced Features Quick Start Guide

## 🚀 Getting Started

### Accessing Advanced Features

1. **From Main Dashboard:**
   - Click "Advanced" in the header navigation
   - Or navigate to: `http://localhost:5173/advanced`

2. **From Node Inspector:**
   - Click "Node Inspector" in the header
   - Select any node to see detailed advanced features

---

## 1️⃣ SLA Verification

### What It Does
Verifies storage proofs on-chain and monitors Service Level Agreement compliance using real RPC data.

### How to Use

**Network-Wide View:**
1. Go to Advanced Features page
2. Click "SLA Verification" tab
3. View network compliance statistics

**Per-Node View:**
1. Open Node Inspector
2. Select a node
3. Scroll to "SLA Verification" panel
4. Click "Load SLA Data" to see:
   - Uptime percentage
   - Storage reliability
   - Proof submission rate
   - Average latency
   - SLA violations (if any)

**Understanding the Metrics:**
- 🟢 **Excellent**: All metrics above targets
- 🔵 **Good**: Minor deviations from targets
- 🟡 **Warning**: Multiple metrics below targets
- 🔴 **Violation**: Critical metrics failing

**Storage Proofs Tab:**
- View all on-chain storage proofs
- Check verification status (✓ verified / ✗ failed)
- See proof timestamps and block heights

---

## 2️⃣ Web3 Alerts

### What It Does
Sends real-time alerts about your nodes via XMTP (Web3 messaging) or Telegram.

### Setup Instructions

**Option A: Telegram (Recommended)**

1. Create a Telegram bot:
   - Message @BotFather on Telegram
   - Send `/newbot` and follow instructions
   - Copy the bot token

2. Get your Chat ID:
   - Message @userinfobot on Telegram
   - Copy your chat ID

3. Configure in the app:
   - Go to Advanced Features → Web3 Alerts
   - Click "Setup" tab
   - Paste bot token and chat ID
   - Click "Connect"

**Option B: XMTP (Web3 Wallet)**

1. Install XMTP packages (optional):
   ```bash
   cd xandeum-observer
   npm install @xmtp/xmtp-js ethers
   ```

2. Configure in the app:
   - Go to Advanced Features → Web3 Alerts
   - Click "Setup" tab
   - Enter your Ethereum address
   - Click "Connect"

### Managing Alert Rules

1. Go to "Rules" tab
2. Toggle alerts on/off:
   - **Node Offline** - Critical alerts when node goes down
   - **High Latency** - Warnings for slow response times
   - **Storage Full** - Alerts when storage reaches 90%
   - **SLA Violation** - Critical SLA compliance issues

3. Each rule has:
   - Cooldown period (prevents spam)
   - Severity level
   - Multiple channels (XMTP, Telegram, Webhook)

### Viewing Alert History

1. Go to "History" tab
2. See all triggered alerts with:
   - Timestamp
   - Severity
   - Delivery status
   - Alert details

---

## 3️⃣ AI Reward Optimization

### What It Does
Analyzes your node performance and provides AI-driven suggestions to maximize rewards.

### How to Use

**Viewing Optimization Suggestions:**

1. Open Node Inspector
2. Select a node
3. Scroll to "AI Reward Optimization" panel
4. Click "Suggestions" tab

**Understanding Suggestions:**

Each suggestion shows:
- 🔴 **Critical**: Immediate action needed
- 🟠 **High**: Important optimization
- 🟡 **Medium**: Beneficial improvement
- 🟢 **Low**: Optional enhancement

**Suggestion Details:**
- **Expected Impact:**
  - Reward increase (%)
  - Cost reduction (%)
  - Performance gain (%)
  - Risk reduction (%)

- **Implementation:**
  - Difficulty level (easy/medium/hard)
  - Timeframe (days/weeks)
  - Estimated cost ($)
  - Step-by-step instructions

**Example Suggestions:**
- Improve uptime to 99.9%
- Optimize network latency
- Expand storage capacity
- Consider geographic relocation
- Optimize cost-reward ratio

### Reward Forecasting

1. Click "Forecast" tab
2. Select timeframe (1d, 7d, 30d, 90d)
3. View:
   - Current projection
   - Optimized projection
   - Potential increase (%)
   - Reward factors breakdown
   - Market conditions

**Reward Factors:**
- Uptime multiplier
- Latency performance
- Storage efficiency
- Location bonus
- Network contribution

### Capacity Planning

1. Click "Capacity Plan" tab
2. View AI-generated expansion plan:
   - Current vs recommended capacity
   - Growth projections (30d, 90d, 1y)
   - Investment required
   - ROI calculation
   - Breakeven timeline

**Making Decisions:**
- Compare investment cost vs. projected returns
- Check breakeven period (days)
- Review yearly ROI percentage
- Consider market growth trends

---

## 💡 Pro Tips

### SLA Verification
- Check SLA metrics daily to catch issues early
- Monitor proof submission rate - should be >95%
- Address violations immediately to avoid penalties
- Use historical trends to predict future issues

### Web3 Alerts
- Enable both Telegram and XMTP for redundancy
- Set appropriate cooldown periods (30-60 minutes)
- Test alerts by temporarily disabling a node
- Review alert history weekly to identify patterns

### AI Optimization
- Implement high-priority suggestions first
- Track reward changes after implementing suggestions
- Re-run optimization monthly as network evolves
- Compare your node performance to network averages
- Use capacity planning before hardware purchases

---

## 🔍 Troubleshooting

### SLA Verification Issues
**Problem:** No storage proofs found
- **Solution:** Wait 24 hours for proofs to accumulate
- **Check:** Backend API is running on port 3002

**Problem:** SLA metrics not loading
- **Solution:** Refresh the page and try again
- **Check:** Node has historical data available

### Web3 Alerts Issues
**Problem:** Telegram alerts not working
- **Solution:** Verify bot token and chat ID are correct
- **Test:** Send a test message to your bot
- **Check:** Bot has permission to send messages

**Problem:** XMTP not available
- **Solution:** Install required packages:
  ```bash
  npm install @xmtp/xmtp-js ethers
  ```

### AI Optimization Issues
**Problem:** No suggestions generated
- **Solution:** Node may already be optimized
- **Check:** Node has sufficient historical data (>24 hours)

**Problem:** Forecasts seem inaccurate
- **Solution:** Forecasts are based on current trends
- **Note:** Market conditions can change rapidly

---

## 📊 Best Practices

### Daily Routine
1. Check network SLA compliance
2. Review any new alerts
3. Monitor node performance trends

### Weekly Routine
1. Review alert history for patterns
2. Check AI optimization suggestions
3. Update alert rules if needed

### Monthly Routine
1. Run full AI optimization analysis
2. Review capacity planning recommendations
3. Implement high-priority suggestions
4. Compare performance to previous month

---

## 🎯 Quick Actions

### I want to...

**...know if my node is meeting SLA requirements**
→ Advanced Features → SLA Verification → Select your node

**...get notified when my node goes down**
→ Advanced Features → Web3 Alerts → Setup → Configure Telegram

**...increase my node rewards**
→ Node Inspector → Select node → AI Optimization → Suggestions

**...plan storage expansion**
→ Node Inspector → Select node → AI Optimization → Capacity Plan

**...see network-wide health**
→ Advanced Features → Overview cards at top

**...check historical performance**
→ Node Inspector → Select node → SLA Verification → Proofs tab

---

## 📞 Support

For issues or questions:
1. Check the main README.md
2. Review ADVANCED_FEATURES_IMPLEMENTATION.md for technical details
3. Check browser console for error messages
4. Verify backend API is running: `http://localhost:3002`

---

**Happy Optimizing! 🚀**
