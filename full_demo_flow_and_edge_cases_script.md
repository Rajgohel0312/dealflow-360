# 🎬 DealFlow 360 — Master End-to-End Demo Script & Edge-Case Showcase

> **Hackathon Presentation Guide**: Follow this exact step-by-step sequence during your presentation to demonstrate the complete B2B revenue workflow and trigger **every single technical edge case** live!

---

## 👥 STAGE 1: Team & User Creation (All 5 Roles)

Log in as **Super Admin** (`admin@dealflow.com` / `Password123!`) under **Admin -> Team Management** and create the 4 role-based team accounts:

### 1️⃣ Create Sales Rep Account
- **Name**: `Alex Rivera`
- **Email**: `salesrep@dealflow.com`
- **Password**: `Password123!`
- **Role**: `Sales Rep`

### 2️⃣ Create Manager Account
- **Name**: `Marcus Vance`
- **Email**: `manager@dealflow.com`
- **Password**: `Password123!`
- **Role**: `Manager`

### 3️⃣ Create Finance Account
- **Name**: `Fiona Chen`
- **Email**: `finance@dealflow.com`
- **Password**: `Password123!`
- **Role**: `Finance`

### 4️⃣ Create Operations Account
- **Name**: `Owen Miller`
- **Email**: `ops@dealflow.com`
- **Password**: `Password123!`
- **Role**: `Operations`

---

## 📦 STAGE 2: Catalog, Price Lists & Discount Matrix Setup

Log in as **Super Admin** (`admin@dealflow.com` / `Password123!`):

### A. Categories (Catalog -> Categories)
- **Category Name**: `Enterprise Cloud Infrastructure`
- **Description**: `High performance rack servers, data center hardware and cloud software subscriptions`

### B. Master Products (Catalog -> Products)

#### Product A (Physical Hardware)
- **Product Name**: `Dell PowerEdge R750 Rack Server`
- **SKU**: `SKU-SRV-R750`
- **Base Price**: `250000`
- **Cost Price**: `180000`
- **Unit**: `units`
- **Product Type**: `ONE_TIME` *(Requires Warehouse Stock)*
- **Tax Rate**: `18`

#### Product B (SaaS Digital Subscription)
- **Product Name**: `DealFlow Enterprise ERP SaaS License`
- **SKU**: `SKU-ERP-SAAS-01`
- **Base Price**: `60000`
- **Cost Price**: `15000`
- **Unit**: `licenses`
- **Product Type**: `SUBSCRIPTION` *(Bypasses Warehouse Shelf Stock!)*
- **Tax Rate**: `18`

### C. Price Lists & Quantity Tiers (Catalog -> Price Lists)
- **Price List Name**: `Enterprise Wholesale 2026`
- **Currency**: `INR`
- **Description**: `Volume wholesale price list for corporate clients`
- **Click "View Items" -> Add Item Tier 1**:
  - **Product**: `Dell PowerEdge R750 Rack Server`
  - **Tier Price**: `250000`
  - **Min Qty**: `1` | **Max Qty**: `4`
- **Add Item Tier 2 (Volume Bulk Discount)**:
  - **Product**: `Dell PowerEdge R750 Rack Server`
  - **Tier Price**: `225000` *(10% base discount for bulk orders)*
  - **Min Qty**: `5` | **Max Qty**: `Unlimited`

### D. Tier Discount Matrix & Escalation Rules (Catalog -> Discount Matrix)
- **Rule 1 (Bronze Tier)**: Customer Tier = `Bronze`, Category = `Enterprise Cloud Infrastructure`, Max Allowed Discount = `5%`, Escalation = `MANAGER`
- **Rule 2 (Silver Tier)**: Customer Tier = `Silver`, Category = `Enterprise Cloud Infrastructure`, Max Allowed Discount = `10%`, Escalation = `MANAGER`
- **Rule 3 (Gold Tier)**: Customer Tier = `Gold`, Category = `Enterprise Cloud Infrastructure`, Max Allowed Discount = `20%`, Escalation = `FINANCE`

---

## 🏭 STAGE 3: Operations & Warehouse Setup

Under **Operations -> Warehouses & Inventory**:
- **Warehouse Name**: `Central Logistics Hub (WH-MAIN)`
- **Warehouse Code**: `WH-MAIN`
- **Address**: `Plot 12, Bhiwandi Logistics Zone, Thane, MH 421302`
- **Add Stock for Physical Server (`SKU-SRV-R750`)**: `100` units

---

## 🏢 STAGE 4: Customer Setup & Portal User

Under **Customers -> Add Customer**:
- **Company Name**: `Acme Global Enterprises Pvt Ltd`
- **Email**: `procurement@acmeglobal.com`
- **Phone**: `+91 98765 43210`
- **Customer Tier**: `Silver` *(Max allowed discount threshold without manager review = 10%)*
- **Assigned Sales Rep**: `Alex Rivera (salesrep@dealflow.com)`
- **GSTIN**: `27AABCA1234F1ZM`
- **Billing Address**: `Suite 404, Tech Park, BKC, Mumbai, MH 400051`

Under **Customer User Creation**:
- **Customer User Email**: `customer@acme.com`
- **Password**: `Password123!`

### 📧 Email Action 1: Temporary Credentials Email to Customer User
- **Click "Send Credentials" Button** on the Customer User row under Customer Company Details (`POST /api/customer/:customerId/users/:userId/send-credentials`).
- **System Behavior**: Sends branded Welcome email with generated temporary password (`TempPass#...`), login portal URL, and credentials directly to the customer user (`customer@acme.com`). Sets `must_change_password: true` for initial portal login.

---

## 📄 STAGE 5: Quotation Creation & Edge Case 1 (Discount Escalation)

1. Log out as Admin and log in as **Sales Rep** (`salesrep@dealflow.com` / `Password123!`).
2. Navigate to **Quotations -> Create Quotation**:
   - **Customer**: `Acme Global Enterprises Pvt Ltd`
   - **Price List**: `Enterprise Wholesale 2026`
   - **Notes**: `Q3 Infrastructure Modernization Deal`
3. Add Line Item:
   - **Product**: `Dell PowerEdge R750 Rack Server`
   - **Quantity**: `5`
   - **Line Discount (%)**: `14`

### 🔥 LIVE EDGE CASE 1: Discount Exceeding Tier Threshold
- **Action**: Click **Submit Quotation**.
- **System Behavior**:
  - Customer Tier is `Silver` (Max allowed discount = 10%).
  - Requested discount is `14%` (> 10%).
  - **Result**: System blocks auto-approval, updates status to **`UNDER_REVIEW`**, sets `risk_level: MANAGER`, and routes to the **Manager Approval Queue**!

---

## 👔 STAGE 6: Manager Review & Order Conversion

1. Log out as Sales Rep and log in as **Manager** (`manager@dealflow.com` / `Password123!`).
2. Navigate to **Approvals -> Pending Quotations**:
   - Open quotation for `Acme Global Enterprises`.
   - Review risk reason: `"Requested 14% discount exceeds Silver Tier limit of 10%"`.
   - Click **Approve Quotation** (Comments: `Approved special volume discount for Q3 deal`).
   - Quotation status switches to **`APPROVED`**.
3. Click **Convert to Sales Order**:
   - Generates Sales Order `SO-XXXXXX`.
   - Uses **Redis Distributed Mutex (`acquireLock`)** to prevent duplicate order generation!

---

## 🚚 STAGE 7: Fulfillment & Edge Cases 2 & 3 (Digital Bypass & Auto Invoice)

1. Log out as Manager and log in as **Operations** (`ops@dealflow.com` / `Password123!`).
2. Navigate to **Fulfillment -> Create Fulfillment**:
   - **Select Sales Order**: `SO-XXXXXX`
   - **Warehouse**: `Central Logistics Hub (WH-MAIN)`

### 🔥 LIVE EDGE CASE 2: SaaS Subscription Bypass
- If order contains `DealFlow Enterprise ERP SaaS License` (`SUBSCRIPTION`), click **Initiate Fulfillment**.
- **Result**: Backend logs `ℹ️ Product is a SUBSCRIPTION. Bypassing physical warehouse shelf reservation.` and allocates digital licenses instantly!

### 🔥 LIVE EDGE CASE 3: Insufficient Physical Stock Guard
- If you attempt to fulfill 500 physical server units when warehouse only has 100:
- **Result**: System blocks execution with error `AppError: Insufficient inventory available! Stock Available: 100, Requested: 500`.

3. Process Fulfillment Status Lifecycle:
   - Click **Pick** -> Status: `PICKED`
   - Click **Pack** -> Status: `PACKED`
   - Click **Ship** (Tracking Number: `TRK-FDX-99887766`, Carrier: `FedEx Express Freight`) -> Status: `SHIPPED`
   - Click **Deliver** -> Status: `DELIVERED`

### 🔥 LIVE EDGE CASE 4: Automated Commercial Invoice Generation
- **Action**: Updating fulfillment to `DELIVERED`.
- **System Behavior**: Backend automatically generates a commercial invoice (`INV-00000X`) in `UNPAID` status under Finance!

---

## 💳 STAGE 8: Finance Payment Recording

1. Log out as Operations and log in as **Finance** (`finance@dealflow.com` / `Password123!`).
2. Navigate to **Finance -> Invoices**:
   - Open generated invoice `INV-00000X`.
   - Click **Record Payment**:
     - **Payment Amount**: `1327500` *(Full Invoice Amount)*
     - **Payment Method**: `BANK_TRANSFER`
     - **Transaction Reference**: `TXN-HDFC-90817263`
     - **Notes**: `Full settlement via HDFC NEFT Transfer.`
   - Invoice status switches from `UNPAID` to **`PAID`**!

### 📧 Email Action 2: Commercial Invoice Email (With Recipient Selection Modal)
- **Click "Send Invoice Email" Button** in the Invoice Details page header (`POST /api/invoices/:id/send-email`).
- **System Behavior**:
  1. Opens interactive recipient modal allowing selection of: **All Recipients**, **Company Procurement Email**, or **Specific Customer User**.
  2. Dispatches branded HTML Commercial Invoice asynchronously in background (< 20ms response time).
  3. Includes line item breakdown, totals, GST tax, and primary CTA button: **"View Invoice →"** linking directly to `/customer/login`.

---

## 🛑 STAGE 9: Relational Integrity & Safe Deletion Guards

### 🔥 LIVE EDGE CASE 5: Category Deletion Restriction
1. Go to **Catalog -> Categories**.
2. Click the **Trash icon** next to `Enterprise Cloud Infrastructure`.
3. **Result**: System pops up custom confirmation modal and blocks deletion with error banner:
   > 🛡️ **Cannot delete category because it contains associated products**

### 🔥 LIVE EDGE CASE 6: Product Deletion Restriction
1. Go to **Catalog -> Products**.
2. Click the **Trash icon** next to `Dell PowerEdge R750 Rack Server`.
3. **Result**: System pops up custom confirmation modal and blocks deletion with error banner:
   > 🛡️ **Cannot delete product because it is referenced in existing quotations / sales orders**

---

## 🛡️ STAGE 10: Live Security Edge Cases (Rate Limiting, Auth Lockout & JWT Revocation)

### 🔥 LIVE EDGE CASE 7: Progressive Auth Backoff & 15-Minute Lockout
1. Go to Login screen (`/login`).
2. Enter email `admin@dealflow.com` and **WRONG password** (`wrong123`).
3. Click Login repeatedly:
   - **Attempts 1–2**: Returns immediate 401 error (~5ms).
   - **Attempts 3–4**: Artificial backoff delay applied in Redis (**2 seconds delay on 3rd attempt, 4 seconds delay on 4th attempt**).
   - **Attempt 5**: **15-Minute Account Lockout** triggered returning `HTTP 429 Too Many Requests`!

### 🔥 LIVE EDGE CASE 8: JWT Token Revocation Blacklist on Logout
1. Log in as `admin@dealflow.com`.
2. Click **Logout**.
3. Open browser Developer Tools -> Network tab -> Re-send the previous `GET /api/me/profile` request using the logged-out Bearer token.
4. **Result**: Backend returns `401 Unauthorized` (`"Token has been revoked"`), proving that Redis token blacklisting invalidated the JWT instantly!
