import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // ============================================================
  // USERS & AUTH
  // ============================================================
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal('super_admin'),
      v.literal('admin'),
      v.literal('sales_manager'),
      v.literal('sales_executive'),
      v.literal('survey_engineer'),
      v.literal('purchase_manager'),
      v.literal('warehouse_manager'),
      v.literal('technician'),
      v.literal('subsidy_coordinator'),
      v.literal('accountant'),
      v.literal('service_manager'),
    ),
    branchId: v.optional(v.id('branches')),
    isActive: v.boolean(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_clerkId', ['clerkId'])
    .index('by_email', ['email'])
    .index('by_role', ['role']),

  // ============================================================
  // COMPANY & BRANCHES
  // ============================================================
  company: defineTable({
    name: v.string(),
    legalName: v.string(),
    gstin: v.string(),
    pan: v.string(),
    cin: v.optional(v.string()),
    addressLine1: v.string(),
    addressLine2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    pincode: v.string(),
    email: v.string(),
    phone: v.string(),
    website: v.optional(v.string()),
    logoStorageId: v.optional(v.string()),
    bankAccounts: v.array(
      v.object({
        bankName: v.string(),
        accountNumber: v.string(),
        ifsc: v.string(),
        branch: v.string(),
        accountType: v.string(),
        isPrimary: v.boolean(),
      }),
    ),
    oemDealerships: v.array(
      v.object({
        oemName: v.string(),
        dealerCode: v.string(),
        region: v.string(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  branches: defineTable({
    name: v.string(),
    code: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    pincode: v.string(),
    phone: v.string(),
    managerUserId: v.optional(v.id('users')),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index('by_code', ['code']),

  warehouses: defineTable({
    name: v.string(),
    code: v.string(),
    branchId: v.id('branches'),
    address: v.string(),
    city: v.string(),
    pincode: v.string(),
    managerId: v.optional(v.id('users')),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index('by_branch', ['branchId']),

  // ============================================================
  // CRM — LEADS
  // ============================================================
  leads: defineTable({
    leadNumber: v.string(),
    source: v.union(
      v.literal('website'),
      v.literal('meta_ads'),
      v.literal('google_ads'),
      v.literal('walk_in'),
      v.literal('referral'),
      v.literal('electrician_partner'),
      v.literal('builder_channel'),
      v.literal('manual'),
    ),
    status: v.union(
      v.literal('new'),
      v.literal('contacted'),
      v.literal('interested'),
      v.literal('survey_scheduled'),
      v.literal('survey_completed'),
      v.literal('quotation_sent'),
      v.literal('negotiation'),
      v.literal('won'),
      v.literal('lost'),
    ),
    // Customer basics
    name: v.string(),
    mobile: v.string(),
    email: v.optional(v.string()),
    addressLine1: v.string(),
    city: v.string(),
    state: v.string(),
    pincode: v.string(),
    // Energy profile
    electricityBillAmt: v.optional(v.number()),
    monthlyConsumptionKwh: v.optional(v.number()),
    rooftopType: v.optional(v.union(v.literal('rcc'), v.literal('tin'), v.literal('asbestos'), v.literal('other'))),
    propertyType: v.optional(v.union(v.literal('residential'), v.literal('commercial'), v.literal('industrial'))),
    discomName: v.optional(v.string()),
    discomConsumerNo: v.optional(v.string()),
    // Assignment
    assignedToUserId: v.optional(v.id('users')),
    branchId: v.optional(v.id('branches')),
    // Conversion
    convertedToCustomerId: v.optional(v.id('customers')),
    lostReason: v.optional(v.string()),
    expectedCapacityKw: v.optional(v.number()),
    // Meta
    referredByCustomerId: v.optional(v.id('customers')),
    tags: v.optional(v.array(v.string())),
    createdByUserId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_assigned', ['assignedToUserId'])
    .index('by_mobile', ['mobile'])
    .index('by_leadNumber', ['leadNumber'])
    .index('by_branch', ['branchId']),

  leadActivities: defineTable({
    leadId: v.id('leads'),
    type: v.union(
      v.literal('note'),
      v.literal('call'),
      v.literal('whatsapp'),
      v.literal('email'),
      v.literal('visit'),
      v.literal('status_change'),
      v.literal('follow_up_set'),
      v.literal('task'),
    ),
    content: v.string(),
    outcome: v.optional(v.string()),
    followUpAt: v.optional(v.number()),
    doneByUserId: v.id('users'),
    createdAt: v.number(),
  }).index('by_lead', ['leadId']),

  // ============================================================
  // CUSTOMERS
  // ============================================================
  customers: defineTable({
    customerNumber: v.string(),
    leadId: v.optional(v.id('leads')),
    name: v.string(),
    mobile: v.string(),
    altMobile: v.optional(v.string()),
    email: v.optional(v.string()),
    addressLine1: v.string(),
    addressLine2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    pincode: v.string(),
    aadhaarNumber: v.optional(v.string()),
    panNumber: v.optional(v.string()),
    gstin: v.optional(v.string()),
    propertyType: v.union(v.literal('residential'), v.literal('commercial'), v.literal('industrial')),
    discomName: v.string(),
    discomConsumerNo: v.string(),
    bankAccountName: v.optional(v.string()),
    bankAccountNumber: v.optional(v.string()),
    bankIfsc: v.optional(v.string()),
    bankName: v.optional(v.string()),
    branchId: v.id('branches'),
    accountManagerId: v.optional(v.id('users')),
    kycVerified: v.boolean(),
    isActive: v.boolean(),
    createdByUserId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_customerNumber', ['customerNumber'])
    .index('by_mobile', ['mobile'])
    .index('by_branch', ['branchId']),

  // ============================================================
  // SITE SURVEY
  // ============================================================
  surveys: defineTable({
    surveyNumber: v.string(),
    leadId: v.id('leads'),
    customerId: v.optional(v.id('customers')),
    status: v.union(v.literal('scheduled'), v.literal('in_progress'), v.literal('completed'), v.literal('cancelled')),
    scheduledAt: v.number(),
    completedAt: v.optional(v.number()),
    assignedEngineerId: v.id('users'),
    // Location
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    // Rooftop details
    rooftopAreaSqFt: v.optional(v.number()),
    rooftopType: v.optional(v.string()),
    rooftopCondition: v.optional(v.string()),
    structuralStrength: v.optional(v.union(v.literal('good'), v.literal('moderate'), v.literal('poor'))),
    shadowAnalysis: v.optional(v.string()),
    // Load assessment
    connectedLoadKw: v.optional(v.number()),
    contractedDemandKva: v.optional(v.number()),
    averageMonthlyConsumption: v.optional(v.number()),
    // System recommendation
    recommendedCapacityKw: v.optional(v.number()),
    recommendedPanelType: v.optional(v.string()),
    recommendedInverterType: v.optional(v.string()),
    panelCount: v.optional(v.number()),
    panelPlacementNotes: v.optional(v.string()),
    // Checklist (JSON object)
    checklist: v.optional(v.any()),
    remarks: v.optional(v.string()),
    customerSignatureStorageId: v.optional(v.string()),
    photoStorageIds: v.optional(v.array(v.string())),
    documentStorageIds: v.optional(v.array(v.string())),
    createdByUserId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_lead', ['leadId'])
    .index('by_engineer', ['assignedEngineerId'])
    .index('by_status', ['status']),

  // ============================================================
  // PRODUCT CATALOG (SKU)
  // ============================================================
  products: defineTable({
    sku: v.string(),
    name: v.string(),
    category: v.union(
      v.literal('panel'),
      v.literal('inverter'),
      v.literal('battery'),
      v.literal('structure'),
      v.literal('cable'),
      v.literal('junction_box'),
      v.literal('spd'),
      v.literal('mc4_connector'),
      v.literal('earthing_kit'),
      v.literal('net_meter'),
      v.literal('accessory'),
      v.literal('labor'),
      v.literal('transport'),
      v.literal('documentation'),
    ),
    brand: v.string(),
    model: v.string(),
    specifications: v.optional(v.any()), // Watts, efficiency, type etc
    unit: v.string(),
    hsnCode: v.string(),
    gstRate: v.number(), // 5, 12, 18
    mrp: v.optional(v.number()),
    standardCost: v.optional(v.number()),
    trackSerial: v.boolean(),
    trackBatch: v.boolean(),
    minStockLevel: v.optional(v.number()),
    reorderQty: v.optional(v.number()),
    isActive: v.boolean(),
    imageStorageId: v.optional(v.string()),
    createdByUserId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_sku', ['sku'])
    .index('by_category', ['category']),

  // ============================================================
  // VENDORS / OEM
  // ============================================================
  vendors: defineTable({
    vendorNumber: v.string(),
    name: v.string(),
    legalName: v.string(),
    type: v.union(v.literal('oem'), v.literal('distributor'), v.literal('service_provider'), v.literal('transporter')),
    gstin: v.string(),
    pan: v.string(),
    email: v.string(),
    phone: v.string(),
    addressLine1: v.string(),
    city: v.string(),
    state: v.string(),
    pincode: v.string(),
    contactPerson: v.string(),
    contactPhone: v.string(),
    paymentTermsDays: v.number(),
    creditLimitAmt: v.optional(v.number()),
    bankAccountName: v.optional(v.string()),
    bankAccountNumber: v.optional(v.string()),
    bankIfsc: v.optional(v.string()),
    rating: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_vendorNumber', ['vendorNumber'])
    .index('by_gstin', ['gstin']),

  // ============================================================
  // QUOTATIONS
  // ============================================================
  quotations: defineTable({
    quotationNumber: v.string(),
    version: v.number(),
    parentQuotationId: v.optional(v.id('quotations')),
    leadId: v.id('leads'),
    customerId: v.optional(v.id('customers')),
    surveyId: v.optional(v.id('surveys')),
    status: v.union(
      v.literal('draft'),
      v.literal('sent'),
      v.literal('under_negotiation'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('expired'),
      v.literal('converted_to_order'),
    ),
    validTill: v.number(),
    // System spec
    systemCapacityKw: v.number(),
    panelCount: v.number(),
    lineItems: v.array(
      v.object({
        productId: v.id('products'),
        productName: v.string(),
        sku: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        discountPct: v.optional(v.number()),
        taxRate: v.number(),
        taxableAmount: v.number(),
        taxAmount: v.number(),
        lineTotal: v.number(),
        hsnCode: v.string(),
      }),
    ),
    // Financials
    subtotal: v.number(),
    discountAmount: v.number(),
    taxableValue: v.number(),
    cgstAmount: v.number(),
    sgstAmount: v.number(),
    igstAmount: v.number(),
    totalAmount: v.number(),
    // Subsidy
    subsidyEligibleCapacityKw: v.optional(v.number()),
    subsidyCategory: v.optional(v.union(v.literal('upto_2kw'), v.literal('2_3kw'), v.literal('above_3kw'))),
    subsidyAmountEstimated: v.optional(v.number()),
    netAmountAfterSubsidy: v.optional(v.number()),
    // Payment terms
    tokenAmountPct: v.optional(v.number()),
    onDeliveryPct: v.optional(v.number()),
    onInstallationPct: v.optional(v.number()),
    onSubsidyPct: v.optional(v.number()),
    // Notes
    termsAndConditions: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
    approvedByUserId: v.optional(v.id('users')),
    approvedAt: v.optional(v.number()),
    discountApprovedByUserId: v.optional(v.id('users')),
    pdfStorageId: v.optional(v.string()),
    createdByUserId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_quotationNumber', ['quotationNumber'])
    .index('by_lead', ['leadId'])
    .index('by_status', ['status']),

  // ============================================================
  // SALES ORDERS
  // ============================================================
  salesOrders: defineTable({
    orderNumber: v.string(),
    quotationId: v.id('quotations'),
    customerId: v.id('customers'),
    leadId: v.id('leads'),
    status: v.union(
      v.literal('draft'),
      v.literal('confirmed'),
      v.literal('in_procurement'),
      v.literal('ready_for_dispatch'),
      v.literal('dispatched'),
      v.literal('installation_pending'),
      v.literal('installed'),
      v.literal('net_meter_pending'),
      v.literal('subsidy_pending'),
      v.literal('completed'),
      v.literal('cancelled'),
    ),
    orderDate: v.number(),
    expectedInstallationDate: v.optional(v.number()),
    // Financials (snapshot from quotation)
    totalAmount: v.number(),
    subsidyAmountEstimated: v.number(),
    netAmount: v.number(),
    // Payment schedule
    paymentSchedule: v.array(
      v.object({
        milestone: v.string(),
        duePct: v.number(),
        dueAmount: v.number(),
        dueDate: v.optional(v.number()),
        paidAmount: v.optional(v.number()),
        paidDate: v.optional(v.number()),
        status: v.union(v.literal('pending'), v.literal('partial'), v.literal('paid')),
      }),
    ),
    // Financing
    isFinanced: v.boolean(),
    financierName: v.optional(v.string()),
    loanAmount: v.optional(v.number()),
    loanAccountNumber: v.optional(v.string()),
    // Agreement
    agreementStorageId: v.optional(v.string()),
    agreementSignedAt: v.optional(v.number()),
    createdByUserId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_orderNumber', ['orderNumber'])
    .index('by_customer', ['customerId'])
    .index('by_status', ['status']),

  // ============================================================
  // PURCHASE MANAGEMENT
  // ============================================================
  purchaseRequisitions: defineTable({
    prNumber: v.string(),
    salesOrderId: v.optional(v.id('salesOrders')),
    status: v.union(
      v.literal('draft'),
      v.literal('pending_approval'),
      v.literal('approved'),
      v.literal('po_created'),
      v.literal('cancelled'),
    ),
    items: v.array(
      v.object({
        productId: v.id('products'),
        productName: v.string(),
        requiredQty: v.number(),
        availableQty: v.number(),
        procureQty: v.number(),
        unit: v.string(),
      }),
    ),
    requiredByDate: v.number(),
    remarks: v.optional(v.string()),
    requestedByUserId: v.id('users'),
    approvedByUserId: v.optional(v.id('users')),
    approvedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_prNumber', ['prNumber']),

  purchaseOrders: defineTable({
    poNumber: v.string(),
    prId: v.optional(v.id('purchaseRequisitions')),
    vendorId: v.id('vendors'),
    status: v.union(
      v.literal('draft'),
      v.literal('sent'),
      v.literal('acknowledged'),
      v.literal('partial_received'),
      v.literal('received'),
      v.literal('cancelled'),
    ),
    poDate: v.number(),
    expectedDeliveryDate: v.optional(v.number()),
    lineItems: v.array(
      v.object({
        productId: v.id('products'),
        productName: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        taxRate: v.number(),
        taxAmount: v.number(),
        lineTotal: v.number(),
        receivedQty: v.optional(v.number()),
      }),
    ),
    subtotal: v.number(),
    taxAmount: v.number(),
    totalAmount: v.number(),
    paymentTermsDays: v.number(),
    deliveryAddress: v.string(),
    warehouseId: v.id('warehouses'),
    termsAndConditions: v.optional(v.string()),
    approvedByUserId: v.optional(v.id('users')),
    pdfStorageId: v.optional(v.string()),
    createdByUserId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_poNumber', ['poNumber'])
    .index('by_vendor', ['vendorId'])
    .index('by_status', ['status']),

  // ============================================================
  // GOODS RECEIPT NOTES
  // ============================================================
  grns: defineTable({
    grnNumber: v.string(),
    poId: v.id('purchaseOrders'),
    warehouseId: v.id('warehouses'),
    status: v.union(v.literal('draft'), v.literal('posted'), v.literal('cancelled')),
    receivedDate: v.number(),
    invoiceNumber: v.optional(v.string()),
    invoiceDate: v.optional(v.number()),
    items: v.array(
      v.object({
        productId: v.id('products'),
        productName: v.string(),
        orderedQty: v.number(),
        receivedQty: v.number(),
        damagedQty: v.number(),
        acceptedQty: v.number(),
        unitPrice: v.number(),
        batchNumber: v.optional(v.string()),
        serialNumbers: v.optional(v.array(v.string())),
      }),
    ),
    photoStorageIds: v.optional(v.array(v.string())),
    remarks: v.optional(v.string()),
    receivedByUserId: v.id('users'),
    postedByUserId: v.optional(v.id('users')),
    postedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_grnNumber', ['grnNumber'])
    .index('by_po', ['poId']),

  // ============================================================
  // INVENTORY / STOCK
  // ============================================================
  inventory: defineTable({
    productId: v.id('products'),
    warehouseId: v.id('warehouses'),
    totalQty: v.number(),
    reservedQty: v.number(),
    availableQty: v.number(),
    damagedQty: v.number(),
    updatedAt: v.number(),
  })
    .index('by_product_warehouse', ['productId', 'warehouseId'])
    .index('by_warehouse', ['warehouseId']),

  stockMovements: defineTable({
    productId: v.id('products'),
    warehouseId: v.id('warehouses'),
    type: v.union(
      v.literal('grn'),
      v.literal('dispatch'),
      v.literal('return'),
      v.literal('transfer_in'),
      v.literal('transfer_out'),
      v.literal('adjustment'),
      v.literal('damage'),
    ),
    quantity: v.number(),
    referenceType: v.string(),
    referenceId: v.string(),
    batchNumber: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    remarks: v.optional(v.string()),
    doneByUserId: v.id('users'),
    createdAt: v.number(),
  })
    .index('by_product', ['productId'])
    .index('by_warehouse', ['warehouseId'])
    .index('by_reference', ['referenceType', 'referenceId']),

  // ============================================================
  // DISPATCH
  // ============================================================
  dispatches: defineTable({
    dispatchNumber: v.string(),
    salesOrderId: v.id('salesOrders'),
    warehouseId: v.id('warehouses'),
    status: v.union(
      v.literal('picking'),
      v.literal('packed'),
      v.literal('dispatched'),
      v.literal('in_transit'),
      v.literal('delivered'),
      v.literal('cancelled'),
    ),
    dispatchDate: v.optional(v.number()),
    estimatedDeliveryDate: v.optional(v.number()),
    deliveredDate: v.optional(v.number()),
    items: v.array(
      v.object({
        productId: v.id('products'),
        productName: v.string(),
        quantity: v.number(),
        serialNumbers: v.optional(v.array(v.string())),
      }),
    ),
    transporterName: v.optional(v.string()),
    lrNumber: v.optional(v.string()),
    vehicleNumber: v.optional(v.string()),
    driverPhone: v.optional(v.string()),
    deliveryAddress: v.string(),
    challanStorageId: v.optional(v.string()),
    podStorageId: v.optional(v.string()),
    createdByUserId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_dispatchNumber', ['dispatchNumber'])
    .index('by_salesOrder', ['salesOrderId'])
    .index('by_status', ['status']),

  // ============================================================
  // INSTALLATION JOBS
  // ============================================================
  installationJobs: defineTable({
    jobNumber: v.string(),
    salesOrderId: v.id('salesOrders'),
    customerId: v.id('customers'),
    dispatchId: v.optional(v.id('dispatches')),
    status: v.union(
      v.literal('scheduled'),
      v.literal('material_issued'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('customer_signoff'),
      v.literal('cancelled'),
    ),
    scheduledDate: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    leadTechnicianId: v.id('users'),
    technicianIds: v.array(v.id('users')),
    // Checklist
    installationChecklist: v.optional(v.any()),
    commissioningChecklist: v.optional(v.any()),
    // System info
    systemCapacityKw: v.number(),
    panelCount: v.number(),
    // Documents & photos
    photoStorageIds: v.optional(v.array(v.string())),
    customerSignoffStorageId: v.optional(v.string()),
    commissioningReportStorageId: v.optional(v.string()),
    remarks: v.optional(v.string()),
    createdByUserId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_jobNumber', ['jobNumber'])
    .index('by_salesOrder', ['salesOrderId'])
    .index('by_status', ['status'])
    .index('by_technician', ['leadTechnicianId']),

  // ============================================================
  // NET METER / DISCOM
  // ============================================================
  netMeterApplications: defineTable({
    applicationNumber: v.string(),
    salesOrderId: v.id('salesOrders'),
    customerId: v.id('customers'),
    installationJobId: v.optional(v.id('installationJobs')),
    discomName: v.string(),
    consumerNumber: v.string(),
    status: v.union(
      v.literal('application_draft'),
      v.literal('application_submitted'),
      v.literal('inspection_scheduled'),
      v.literal('inspection_done'),
      v.literal('approved'),
      v.literal('meter_installed'),
      v.literal('activated'),
      v.literal('rejected'),
    ),
    applicationDate: v.optional(v.number()),
    inspectionDate: v.optional(v.number()),
    approvalDate: v.optional(v.number()),
    meterInstallationDate: v.optional(v.number()),
    activationDate: v.optional(v.number()),
    coordinatorId: v.id('users'),
    documentStorageIds: v.optional(v.array(v.string())),
    remarks: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_applicationNumber', ['applicationNumber'])
    .index('by_salesOrder', ['salesOrderId'])
    .index('by_status', ['status']),

  // ============================================================
  // PM SURYA SUBSIDY
  // ============================================================
  subsidyApplications: defineTable({
    applicationNumber: v.string(),
    salesOrderId: v.id('salesOrders'),
    customerId: v.id('customers'),
    netMeterAppId: v.optional(v.id('netMeterApplications')),
    portalApplicationNumber: v.optional(v.string()),
    status: v.union(
      v.literal('draft'),
      v.literal('documents_collected'),
      v.literal('submitted_to_portal'),
      v.literal('under_review'),
      v.literal('inspection_pending'),
      v.literal('inspection_done'),
      v.literal('approved'),
      v.literal('payment_pending'),
      v.literal('paid'),
      v.literal('rejected'),
    ),
    systemCapacityKw: v.number(),
    subsidyCategory: v.union(v.literal('upto_2kw'), v.literal('2_3kw'), v.literal('above_3kw')),
    subsidyAmountEligible: v.number(),
    subsidyAmountApproved: v.optional(v.number()),
    subsidyAmountReceived: v.optional(v.number()),
    subsidyReceivedDate: v.optional(v.number()),
    // Documents
    aadhaarStorageId: v.optional(v.string()),
    panStorageId: v.optional(v.string()),
    electricityBillStorageId: v.optional(v.string()),
    bankDetailsStorageId: v.optional(v.string()),
    propertyProofStorageId: v.optional(v.string()),
    installationPhotoStorageIds: v.optional(v.array(v.string())),
    // Customer details for portal
    aadhaarNumber: v.string(),
    panNumber: v.optional(v.string()),
    bankAccountNumber: v.string(),
    bankIfsc: v.string(),
    // Timeline
    submittedAt: v.optional(v.number()),
    approvedAt: v.optional(v.number()),
    inspectionDate: v.optional(v.number()),
    coordinatorId: v.id('users'),
    remarks: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_applicationNumber', ['applicationNumber'])
    .index('by_salesOrder', ['salesOrderId'])
    .index('by_status', ['status']),

  // ============================================================
  // FINANCE — INVOICES
  // ============================================================
  invoices: defineTable({
    invoiceNumber: v.string(),
    type: v.union(v.literal('tax_invoice'), v.literal('proforma'), v.literal('credit_note'), v.literal('debit_note')),
    salesOrderId: v.optional(v.id('salesOrders')),
    customerId: v.id('customers'),
    status: v.union(
      v.literal('draft'),
      v.literal('sent'),
      v.literal('partial'),
      v.literal('paid'),
      v.literal('cancelled'),
    ),
    invoiceDate: v.number(),
    dueDate: v.number(),
    lineItems: v.array(
      v.object({
        description: v.string(),
        hsnCode: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        discountAmt: v.optional(v.number()),
        taxableAmount: v.number(),
        gstRate: v.number(),
        cgstAmount: v.number(),
        sgstAmount: v.number(),
        igstAmount: v.number(),
        lineTotal: v.number(),
      }),
    ),
    subtotal: v.number(),
    discountAmount: v.number(),
    taxableValue: v.number(),
    cgstTotal: v.number(),
    sgstTotal: v.number(),
    igstTotal: v.number(),
    totalAmount: v.number(),
    paidAmount: v.number(),
    balanceDue: v.number(),
    isIgst: v.boolean(), // Interstate supply
    placeOfSupply: v.string(),
    pdfStorageId: v.optional(v.string()),
    createdByUserId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_invoiceNumber', ['invoiceNumber'])
    .index('by_customer', ['customerId'])
    .index('by_salesOrder', ['salesOrderId'])
    .index('by_status', ['status']),

  // ============================================================
  // PAYMENTS
  // ============================================================
  payments: defineTable({
    paymentNumber: v.string(),
    type: v.union(v.literal('received'), v.literal('made')),
    customerId: v.optional(v.id('customers')),
    vendorId: v.optional(v.id('vendors')),
    salesOrderId: v.optional(v.id('salesOrders')),
    invoiceId: v.optional(v.id('invoices')),
    poId: v.optional(v.id('purchaseOrders')),
    amount: v.number(),
    paymentDate: v.number(),
    mode: v.union(
      v.literal('cash'),
      v.literal('cheque'),
      v.literal('neft'),
      v.literal('rtgs'),
      v.literal('upi'),
      v.literal('bank_transfer'),
    ),
    referenceNumber: v.optional(v.string()),
    bankName: v.optional(v.string()),
    remarks: v.optional(v.string()),
    receiptStorageId: v.optional(v.string()),
    createdByUserId: v.id('users'),
    createdAt: v.number(),
  })
    .index('by_paymentNumber', ['paymentNumber'])
    .index('by_customer', ['customerId'])
    .index('by_salesOrder', ['salesOrderId']),

  // ============================================================
  // SERVICE TICKETS
  // ============================================================
  serviceTickets: defineTable({
    ticketNumber: v.string(),
    customerId: v.id('customers'),
    salesOrderId: v.optional(v.id('salesOrders')),
    type: v.union(v.literal('complaint'), v.literal('warranty_claim'), v.literal('amc'), v.literal('general_service')),
    priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('critical')),
    status: v.union(
      v.literal('open'),
      v.literal('assigned'),
      v.literal('in_progress'),
      v.literal('pending_customer'),
      v.literal('resolved'),
      v.literal('closed'),
    ),
    subject: v.string(),
    description: v.string(),
    assignedTechnicianId: v.optional(v.id('users')),
    scheduledVisitDate: v.optional(v.number()),
    resolvedAt: v.optional(v.number()),
    resolutionNotes: v.optional(v.string()),
    photoStorageIds: v.optional(v.array(v.string())),
    isUnderWarranty: v.boolean(),
    warrantyExpiryDate: v.optional(v.number()),
    createdByUserId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_ticketNumber', ['ticketNumber'])
    .index('by_customer', ['customerId'])
    .index('by_status', ['status'])
    .index('by_technician', ['assignedTechnicianId']),

  // ============================================================
  // AUDIT LOGS
  // ============================================================
  auditLogs: defineTable({
    userId: v.id('users'),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    oldValues: v.optional(v.any()),
    newValues: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_entity', ['entityType', 'entityId'])
    .index('by_user', ['userId'])
    .index('by_createdAt', ['createdAt']),

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  notifications: defineTable({
    userId: v.id('users'),
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal('info'), v.literal('warning'), v.literal('success'), v.literal('error')),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_unread', ['userId', 'isRead']),
});
