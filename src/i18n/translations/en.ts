export const en = {
  // Common
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    filter: "Filter",
    actions: "Actions",
    yes: "Yes",
    no: "No",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    previous: "Previous",
    submit: "Submit",
    close: "Close",
    saveChanges: "Save Changes",
    saving: "Saving...",
    required: "Required",
    acknowledge: "Acknowledge",
    searchPlaceholder: "Search...",
    download: "Download",
    count: "Count",
    value: "Value",
    more: "more",
    showing: "Showing",
    of: "of",
    selectLanguage: "Select Language",
    retry: "Retry",
    none: "None",
    optional: "Optional",
    update: "Update",
  },

  // Status labels
  status: {
    active: "Active",
    inRepair: "In Repair",
    disposed: "Disposed",
    stolen: "Stolen",
    lost: "Lost",
  },

  // Authentication
  auth: {
    welcomeBack: "Welcome Back",
    signInMessage: "Sign in to your account to continue",
    emailAddress: "Email Address",
    password: "Password",
    signIn: "Sign In",
    signingIn: "Signing in...",
    dontHaveAccount: "Don't have an account?",
    createOneNow: "Create one now",
    createAccount: "Create Account",
    startTrialMessage: "Start your free trial today",
    firstName: "First Name",
    lastName: "Last Name",
    companyName: "Company Name",
    creatingAccount: "Creating account...",
    alreadyHaveAccount: "Already have an account?",
    signInLink: "Sign in",
    logout: "Logout",
    invalidEmail: "Invalid email address",
    passwordRequired: "Password is required",
    passwordMinLength: "Password must be at least 8 characters",
    firstNameRequired: "First name is required",
    lastNameRequired: "Last name is required",
    companyNameRequired: "Company name is required",
  },

  // Navigation
  nav: {
    dashboard: "Dashboard",
    assets: "Assets",
    finance: "Finance",
    reports: "Reports",
    maintenance: "Maintenance",
    inventory: "Inventory",
    custodians: "Custodians",
    settings: "Settings",
  },

  // App
  app: {
    assetMaster: "AssetMaster",
    tagline: "Manage Your Assets With Confidence",
    description:
      "Comprehensive fixed asset management and maintenance tracking for modern enterprises.",
    copyright: "© 2026 AssetMaster Web. All rights reserved.",
    startManaging: "Start Managing Your Assets Today",
    joinThousands:
      "Join thousands of companies using AssetMaster to track, maintain, and optimize their fixed assets.",
  },

  // Settings
  settings: {
    title: "Settings",
    description:
      "Configure your AssetMaster system, manage users, and customize your experience.",
    backToSettings: "Back to Settings",
    location: "New Location",

    // Company Settings
    company: {
      title: "Company Settings",
      description: "Manage your company information and preferences",
      companyInformation: "Company Information",
      companyName: "Company Name",
      companyNamePlaceholder: "Enter company name",
      companyNameRequired: "Company name is required",
      companyId: "Company ID",
      companyIdDescription: "This is your unique company identifier",
      accountCreated: "Account Created",

      // Branding
      branding: "Branding",
      companyLogo: "Company Logo",
      clickToSelectLogo: "Click to select logo",
      logoFileTypes: "PNG, JPG up to 5MB",
      uploading: "Uploading...",
      uploadLogo: "Upload Logo",
      logoUploaded: "✓ Logo uploaded",
      removeLogo: "Remove and upload different logo",
      brandColor: "Brand Color",
      brandColorDescription:
        "Choose a primary color for your brand (hex format)",
      brandColorPlaceholder: "#3B82F6",
      invalidHexColor: "Must be a valid hex color (e.g., #3B82F6)",

      // Regional Settings
      regionalSettings: "Regional Settings",
      defaultCurrency: "Default Currency",
      currencyRequired: "Currency is required",
      defaultLanguage: "Default Language",
      languageRequired: "Language is required",
      defaultTimezone: "Default Timezone",
      selectTimezone: "Select timezone...",

      // Email Notifications
      emailNotifications: "Email Notifications",
      enableEmailNotifications: "Enable Email Notifications",
      emailNotificationsDescription:
        "Receive email alerts for important system events",
      notificationEmail: "Notification Email Address",
      notificationEmailPlaceholder: "notifications@company.com",
      notificationEmailDescription:
        "Email address where system notifications will be sent",
      invalidEmailAddress: "Must be a valid email",

      // API Access
      apiAccess: "API Access & Integrations",
      apiKey: "API Key",
      noApiKeyGenerated: "No API key generated",
      apiKeyDescription:
        "Use this key to authenticate API requests. Keep it secure and don't share it publicly.",
      apiDocumentation: "API Documentation",
      apiDocumentationDescription:
        "API endpoints and integration guides will be available soon. The API key above will be used to authenticate your requests.",

      // Messages
      updateSuccess: "Company settings updated successfully",
      updateError: "Failed to update company settings",
      uploadSuccess: "Logo uploaded successfully!",
      uploadError: "Failed to upload logo",
      selectImageFile: "Please select an image file",
      fileSizeError: "File size must be less than 5MB",
      apiKeyGenerated: "New API key generated",
      apiKeyCopied: "API key copied to clipboard",
      failedToLoad: "Failed to load company settings",
      retry: "Retry",
    },

    // Locations
    locations: {
      title: "Physical Locations",
      subtitle: "Manage physical locations where assets are stored or used",
      addLocation: "Add Location",
      editLocation: "Edit Location",
      locationName: "Location Name",
      locationNamePlaceholder: "e.g., Main Warehouse",
      locationNameRequired: "Location name is required",
      locationType: "Location Type",
      selectType: "Select type...",
      locationTypes: {
        WAREHOUSE: "Warehouse",
        OFFICE: "Office",
        RETAIL: "Retail",
        BUILDING: "Building",
        ROOM: "Room",
        FLOOR: "Floor",
        DEPARTMENT: "Department",
        STORAGE: "Storage Area",
        FACILITY: "Facility",
        OTHER: "Other",
      },
      address: "Address",
      addressPlaceholder: "Full address...",
      locationCreated: "Location created successfully",
      locationUpdated: "Location updated successfully",
      locationDeleted: "Location deleted successfully",
      deleteConfirm: "Are you sure you want to delete this location?",
      noLocations: "No locations assigned to this branch",
      newLocation: "New Location",
    },

    // Branches
    branches: {
      title: "Branches",
      subtitle:
        "Manage company branches with unique codes for asset identification",
      addBranch: "Add Branch",
      createBranch: "Create Branch",
      newBranch: "New Branch",
      editBranch: "Edit Branch",
      branchCode: "Branch Code *",
      branchCodeNumerical: "(Numerical code)",
      branchCodePlaceholder: "e.g., 01",
      branchCodeRequired: "Branch code is required",
      branchName: "Branch Name *",
      branchNamePlaceholder: "e.g., Headquarters",
      branchNameRequired: "Branch name is required",
      address: "Address",
      addressPlaceholder: "e.g., 123 Main St, City, State 12345",
      branchCreated: "Branch created successfully!",
      branchUpdated: "Branch updated successfully!",
      branchDeleted: "Branch deleted successfully!",
      failedToCreate: "Failed to create branch",
      failedToUpdate: "Failed to update branch",
      failedToDelete: "Failed to delete branch",
      deleteConfirm:
        "Are you sure you want to delete this branch? This action cannot be undone.",
      noBranches: "No branches yet",
      createFirst: "Create your first branch",
      loading: "Loading branches...",
      code: "Code",
      name: "Name",
      departments: "Departments",
      assets: "Assets",
      noAddress: "No address",
    },

    // Departments
    departments: {
      title: "Departments",
      subtitle:
        "Organize departments by branch with unique codes for asset tracking",
      addDepartment: "Add Department",
      newDepartment: "New Department",
      editDepartment: "Edit Department",
      selectBranch: "Select branch...",
      branchRequired: "Branch is required",
      branch: "Branch *",
      departmentHead: "Department Head",
      noDepartmentHead: "No department head",
      departmentCode: "Department Code *",
      departmentCodeNumerical: "(Numerical)",
      departmentCodePlaceholder: "e.g., 01",
      departmentCodeRequired: "Department code is required",
      departmentName: "Department Name *",
      departmentNamePlaceholder: "e.g., Human Resources",
      departmentNameRequired: "Department name is required",
      departmentCreated: "Department created successfully!",
      departmentUpdated: "Department updated successfully!",
      departmentDeleted: "Department deleted successfully!",
      failedToCreate: "Failed to create department",
      failedToUpdate: "Failed to update department",
      failedToDelete: "Failed to delete department",
      deleteConfirm:
        "Are you sure you want to delete this department? This action cannot be undone.",
      noDepartments: "No departments yet",
      createFirst: "Create your first department",
      createBranchFirst: "Create a branch first to add departments.",
      pleaseCreateBranch:
        "Please create at least one branch before adding departments.",
      loading: "Loading departments...",
      code: "Code",
      name: "Name",
      notAssigned: "Not assigned",
    },

    // Asset Types
    assetTypes: {
      title: "Asset Types",
      subtitle:
        "Define asset type categories (Machinery, Furniture, Vehicles, etc.) with codes",
      addAssetType: "Add Asset Type",
      newAssetType: "New Asset Type",
      editAssetType: "Edit Asset Type",
      typeCode: "Asset Type Code *",
      typeCodeNumerical: "(Numerical code)",
      typeCodePlaceholder: "e.g., 01",
      typeCodeRequired: "Asset type code is required",
      typeName: "Asset Type Name *",
      typeNamePlaceholder: "e.g., Machinery and Equipment",
      typeNameRequired: "Asset type name is required",
      acronym: "Acronym",
      acronymPlaceholder: "e.g., MACH",
      accountingAccount: "Accounting Account",
      accountingAccountPlaceholder: "e.g., 1520",
      depreciableAssetType: "Depreciable Asset Type",
      depreciableHelper: "Enable if assets of this type should be depreciated",
      suggestedTypes: "Suggested Asset Types",
      suggestedHelper: "Common asset type categories you might want to add:",
      machinery: "01 - Machinery and Equipment",
      furniture: "02 - Furniture and Fixtures",
      technology: "03 - Technological Equipment",
      vehicles: "04 - Vehicles",
      electronics: "Electronics",
      assetTypeCreated: "Asset type created successfully!",
      assetTypeUpdated: "Asset type updated successfully!",
      assetTypeDeleted: "Asset type deleted successfully!",
      failedToCreate: "Failed to create asset type",
      failedToUpdate: "Failed to update asset type",
      failedToDelete: "Failed to delete asset type",
      deleteConfirm:
        "Are you sure you want to delete this asset type? This action cannot be undone.",
      noAssetTypes: "No asset types yet",
      createFirst: "Create your first asset type",
      loading: "Loading asset types...",
      code: "Code",
      name: "Name",
      account: "Account",
      depreciable: "Depreciable",
      assets: "Assets",
      yes: "Yes",
      no: "No",
    },

    // Asset Classes
    assetClasses: {
      title: "Asset Classes",
      subtitle:
        "Define asset classes linked to asset types with accounting details",
      addClass: "Add Asset Class",
      newAssetClass: "New Asset Class",
      editClass: "Edit Asset Class",
      selectAssetType: "Select asset type...",
      assetTypeRequired: "Asset type is required",
      assetType: "Asset Type *",
      classCode: "Class Code *",
      classCodePlaceholder: "e.g., 01",
      classCodeRequired: "Class code is required",
      classDescription: "Description *",
      classDescriptionPlaceholder: "e.g., Heavy Machinery",
      classDescriptionRequired: "Description is required",
      budgetCode: "Budget Code",
      budgetCodePlaceholder: "e.g., BUD-2024-001",
      accountNumber: "Accounting Account",
      accountNumberPlaceholder: "e.g., 1520-01",
      classCreated: "Asset class created successfully!",
      classUpdated: "Asset class updated successfully!",
      classDeleted: "Asset class deleted successfully!",
      failedToCreate: "Failed to create asset class",
      failedToUpdate: "Failed to update asset class",
      failedToDelete: "Failed to delete asset class",
      deleteConfirm:
        "Are you sure you want to delete this asset class? This action cannot be undone.",
      noAssetClasses: "No asset classes yet",
      createFirst: "Create your first asset class",
      createAssetTypeFirst: "Create an asset type first to add asset classes.",
      pleaseCreateAssetType:
        "Please create at least one asset type before adding asset classes.",
      loading: "Loading asset classes...",
      description: "Description",
      subclasses: "Subclasses",
    },

    // Asset Subclasses
    assetSubclasses: {
      title: "Asset Subclasses",
      subtitle:
        "Manage asset subclasses for detailed categorization within each asset class",
      addSubclass: "Add Asset Subclass",
      newSubclass: "New Asset Subclass",
      editSubclass: "Edit Asset Subclass",
      selectAssetClass: "Select asset class...",
      assetClassRequired: "Asset class is required",
      assetClass: "Asset Class *",
      subclassCode: "Subclass Code",
      subclassCodePlaceholder: "e.g., LAP-BUS",
      subclassCodeRequired: "Subclass code is required",
      subclassDescription: "Description *",
      subclassDescriptionPlaceholder: "e.g., Excavators",
      subclassDescriptionRequired: "Description is required",
      abbreviation: "Abbreviation",
      abbreviationPlaceholder: "e.g., EXC",
      subclassCreated: "Asset subclass created successfully!",
      subclassUpdated: "Asset subclass updated successfully!",
      subclassDeleted: "Asset subclass deleted successfully!",
      failedToCreate: "Failed to create asset subclass",
      failedToUpdate: "Failed to update asset subclass",
      failedToDelete: "Failed to delete asset subclass",
      deleteConfirm:
        "Are you sure you want to delete this asset subclass? This action cannot be undone.",
      noSubclasses: "No asset subclasses yet",
      createFirst: "Create your first asset subclass",
      createAssetClassFirst:
        "Create an asset class first to add asset subclasses.",
      pleaseCreateAssetClass:
        "Please create at least one asset class before adding asset subclasses.",
      loading: "Loading asset subclasses...",
      description: "Description",
      assetType: "Asset Type",
    },

    // Labels
    labels: {
      title: "Label Settings",
      subtitle:
        "Customize barcode label layout, size, and displayed information",
      labelConfiguration: "Label Configuration",
      labelDimensions: "Label Dimensions",
      width: "Width",
      height: "Height",
      unit: "Unit",
      millimeters: "Millimeters (mm)",
      inches: "Inches",
      layoutConfiguration: "Layout Configuration",
      columnsPerPage: "Columns per Page",
      horizontalSpacing: "Horizontal Spacing (mm)",
      verticalSpacing: "Vertical Spacing (mm)",
      displayFields: "Display Fields",
      displayFieldsHelper: "Select which information to display on each label",
      companyLogoPosition: "Company Logo Position",
      left: "Left",
      center: "Center",
      right: "Right",
      styling: "Styling",
      qrCodeSize: "QR Code Size (pixels)",
      assetTagFontSize: "Asset Tag Font Size (px)",
      assetNameFontSize: "Asset Name Font Size (px)",
      detailsFontSize: "Details Font Size (px)",
      showBorder: "Show Border",
      labelSize: "Label Size",
      small: "Small",
      medium: "Medium",
      large: "Large",
      includeCompanyLogo: "Company Logo",
      includeAssetName: "Asset Name",
      includeAssetTag: "Asset Tag",
      includeCategory: "Category",
      includeLocation: "Location",
      includeBranch: "Branch",
      includeDepartment: "Department",
      includeAssetType: "Asset Type",
      includePurchaseDate: "Include Purchase Date",
      preview: "Preview",
      labelPreview: "Label Preview",
      showPreview: "Show Preview",
      hidePreview: "Hide Preview",
      previewDisclaimer:
        "This is a preview of how your labels will appear when printed. Actual size may vary based on printer settings.",
      settingsUpdated: "Label settings updated successfully!",
      failedToUpdate: "Failed to update label settings",
      failedToLoad: "Failed to load settings",
      retry: "Retry",
      sampleAsset: "Sample Asset",
      logo: "Logo",
      qrCode: "QR Code",
    },

    // Alerts
    alerts: {
      title: "Alert Settings",
      subtitle:
        "Configure automated alerts for asset depreciation milestones and thresholds",
      alertRules: "Alert Rules",
      activeAlerts: "Active Alerts",
      createRule: "Create Alert Rule",
      newAlertRule: "New Alert Rule",
      editRule: "Edit Alert Rule",
      ruleName: "Rule Name",
      ruleNamePlaceholder: "e.g., High Depreciation Alert",
      ruleNameRequired: "Name is required",
      alertType: "Alert Type",
      selectAlertType: "Select alert type...",
      depreciationMilestone: "Depreciation Milestone",
      depreciationThreshold: "Depreciation Threshold",
      bookValueThreshold: "Book Value Threshold",
      fullyDepreciated: "Fully Depreciated",
      maintenanceDue: "Maintenance Due",
      threshold: "Threshold",
      thresholdPlaceholder: "e.g., 80",
      depreciationPercentageThreshold: "Depreciation Percentage Threshold",
      depreciationPercentageHelper:
        "Alert when asset reaches this percentage of depreciation",
      bookValueThresholdAmount: "Book Value Threshold",
      bookValueThresholdHelper: "Alert when book value falls below this amount",
      fullyDepreciatedHelper:
        "This alert triggers when an asset becomes fully depreciated (book value reaches residual value).",
      assetCategory: "Asset Category (Optional)",
      assetCategoryPlaceholder: "Leave empty for all categories",
      assetCategoryHelper: "Limit this alert to specific asset category",
      notifyUsers: "Notify users",
      enableAlert: "Enable this alert",
      ruleCreated: "Alert rule created successfully",
      ruleUpdated: "Alert rule updated successfully",
      ruleDeleted: "Alert rule deleted successfully",
      deleteConfirm: "Are you sure you want to delete this alert setting?",
      checkNow: "Check Now",
      checking: "Checking...",
      noRulesConfigured: "No alert rules configured",
      createFirstRule:
        "Create your first alert rule to get notified about important asset events",
      noActiveAlerts: "No active alerts",
      allWithinThresholds: "All assets are within configured thresholds",
      alertTriggered: "new alerts triggered",
      noNewAlerts: "No new alerts triggered",
      failedToCheck: "Failed to check alerts",
      acknowledge: "Acknowledge",
      alertAcknowledged: "Alert marked as acknowledged",
      failedToAcknowledge: "Failed to mark alert",
      allCategories: "All Categories",
      category: "Category",
      type: "Type",
      status: "Status",
      saving: "Saving...",
      update: "Update",
      create: "Create",
      markAsRead: "Mark as Read",
      viewAsset: "View Asset",
    },

    // Roles
    roles: {
      title: "Roles & Permissions",
      subtitle: "Configure granular permissions for different user roles",
      administrator: "Administrator",
      administratorDescription: "Full system access with all permissions",
      assetManager: "Asset Manager",
      assetManagerDescription: "Manage assets, locations, and assignments",
      employee: "Employee",
      employeeDescription:
        "View assigned assets and update custody information",
      auditor: "Auditor",
      auditorDescription:
        "Read-only access to all asset information and reports",
      editRole: "Edit Role",
      permissions: "Permissions",
      moduleAccess: "Module Access",
      roleName: "Role Name",
      roleNamePlaceholder: "e.g., Asset Manager",
      roleNameRequired: "Role name is required",
      descriptionPlaceholder: "Description of this role...",
      role: "Role",
      roleCreated: "Role created successfully",
      roleUpdated: "Role updated successfully",
      createFailed: "Failed to create role",
      updateFailed: "Failed to update role",
      noPermissions: "No permissions available",
      permissionsSelected: "permissions selected",
      updateRole: "Update Role",
      createRole: "Create Role",
      failedToLoad: "Failed to load roles",
      aboutRoles: "About Roles & Permissions",
      aboutRolesDescription:
        "Roles define what users can do in the system. Assign roles to users in the",
      aboutRolesDescription2: "section.",
      noRoles: "No roles",
      noRolesDescription:
        "Create your first role to start managing user permissions.",
      createFirstRole: "Create First Role",
      userCount: "{count} {count, plural, one {user} other {users}}",
      deleteRole: "Delete Role",
      confirmDelete:
        "Are you sure you want to delete the role '{roleName}'? This action cannot be undone.",
      cannotDeleteRole:
        "Cannot delete this role because it has {count} assigned {count, plural, one {user} other {users}}.",
      roleDeletedSuccess: "Role deleted successfully",
      roleDeletedError: "Failed to delete role",
    },

    // Users
    users: {
      title: "User Management",
      subtitle: "Manage user accounts and role assignments",
      addUser: "Add User",
      newUser: "New User",
      editUser: "Edit User",
      activeUsers: "Active Users",
      allUsers: "All Users",
      inactiveUsers: "Inactive Users",
      user: "User",
      email: "Email",
      role: "Role",
      position: "Position",
      positionJobTitle: "Position / Job Title",
      positionPlaceholder: "e.g., IT Manager",
      identificationNumber: "Identification Number",
      identificationPlaceholder: "e.g., EMP-001",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      lastLogin: "Last Login",
      userCreated: "User created successfully",
      userUpdated: "User updated successfully",
      userDeleted: "User deleted successfully",
      userDeactivated: "User deactivated successfully",
      userActivated: "User activated successfully",
      failedToCreate: "Failed to create user",
      failedToUpdate: "Failed to update user",
      failedToDelete: "Failed to deactivate user",
      failedToLoad: "Failed to load users",
      leaveBlankPassword: "Leave blank to keep current password",
      enterPassword: "Enter password",
      noRoleAssigned: "No role assigned",
      noBranchAssigned: "No branch assigned",
      noDepartmentAssigned: "No department assigned",
      notSpecified: "Not specified",
      selectBranchFirst: "Select a branch first to see departments",
      inactiveUsersNote: "Inactive users cannot log in to the system",
      aboutUserManagement: "About User Management",
      aboutUserManagementText:
        "Users can be assigned roles that define their permissions throughout the system. Deactivated users cannot log in but their data is preserved for audit purposes. Manage roles and permissions in the",
      rolesPermissionsLink: "Roles & Permissions",
      section: "section",
      updateUser: "Update User",
      createUser: "Create User",
      deactivateConfirm:
        "Are you sure you want to deactivate {name}? They will no longer be able to log in.",
      noUsers: "No users found",
      noUsersActive: "There are no active users. Try showing all users.",
      noUsersCompany: "There are no users in your company yet.",
      addFirstUser: "Add First User",
      usersCount: "{count} {count, plural, one {user} other {users}}",
      loading: "Loading...",
      actions: "Actions",
    },

    // Other Settings Features
    features: {
      alertSettings: {
        title: "Alert Settings",
        description:
          "Configure automated alerts for depreciation milestones, book value thresholds, and more.",
      },
      companySettings: {
        title: "Company Settings",
        description:
          "Manage your company information, branding, and general preferences.",
      },
      locations: {
        title: "Physical Locations",
        description:
          "Manage physical locations where assets are stored or used (warehouses, offices, buildings, etc.).",
      },
      branches: {
        title: "Branches",
        description:
          "Manage company branches with unique codes for asset identification.",
      },
      departments: {
        title: "Departments",
        description:
          "Organize departments by branch with unique codes for asset tracking.",
      },
      assetTypes: {
        title: "Asset Types",
        description:
          "Define asset type categories (Machinery, Furniture, Vehicles, etc.) with codes.",
      },
      assetClasses: {
        title: "Asset Classes",
        description:
          "Define asset classes linked to asset types with accounting details and budget codes.",
      },
      assetSubclasses: {
        title: "Asset Subclasses",
        description:
          "Manage asset subclasses for detailed categorization within each asset class.",
      },
      labelSettings: {
        title: "Label Settings",
        description:
          "Customize barcode label layout, size, and what information is displayed when printing.",
      },
      userManagement: {
        title: "User Management",
        description:
          "Add, edit, and manage user accounts with role-based access control.",
      },
      rolesPermissions: {
        title: "Roles & Permissions",
        description:
          "Configure granular permissions for different user roles across all modules.",
      },
      dataManagement: {
        title: "Data Management",
        description:
          "Import/export data, manage backups, and configure data retention policies.",
      },
    },

    configure: "Configure",
    comingSoon: "Coming Soon",
  },

  // Languages
  languages: {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
    ar: "Arabic",
  },

  // Currencies
  currencies: {
    USD: "USD - US Dollar",
    EUR: "EUR - Euro",
    GBP: "GBP - British Pound",
    JPY: "JPY - Japanese Yen",
    CAD: "CAD - Canadian Dollar",
    AUD: "AUD - Australian Dollar",
    CHF: "CHF - Swiss Franc",
    CNY: "CNY - Chinese Yuan",
    INR: "INR - Indian Rupee",
    MXN: "MXN - Mexican Peso",
  },

  // Assets
  assets: {
    title: "Assets",
    subtitle: "Manage and track your fixed assets",
    addAsset: "Add Asset",
    addFirstAsset: "Add Your First Asset",
    noAssetsFound: "No assets found",
    noAssetsMessage: "Get started by adding your first asset to the system.",
    filters: "Filters",
    clearAll: "Clear All",
    search: "Search",
    searchPlaceholder: "Name or tag...",
    status: "Status",
    allStatuses: "All Statuses",
    category: "Category",
    categoryPlaceholder: "Filter by category...",
    location: "Location",
    allLocations: "All Locations",
    branch: "Branch",
    allBranches: "All Branches",
    department: "Department",
    allDepartments: "All Departments",
    assetType: "Asset Type",
    allTypes: "All Types",
    assignedTo: "Assigned To",
    allUsers: "All Users",
    unassigned: "Unassigned",

    // Table headers
    asset: "Asset",
    value: "Value",
    actions: "Actions",

    // Status options
    statusActive: "Active",
    statusInRepair: "In Repair",
    statusDisposed: "Disposed",
    statusStolen: "Stolen",
    statusLost: "Lost",

    // Asset detail
    backToAssets: "Back to Assets",
    basicInformation: "Basic Information",
    manufacturer: "Manufacturer",
    model: "Model",
    serialNumber: "Serial Number",
    description: "Description",

    // Financial section
    financialInformation: "Financial Information",
    acquisitionCost: "Acquisition Cost",
    currentValue: "Current Value",
    residualValue: "Residual Value",
    acquisitionDate: "Acquisition Date",
    serviceDate: "Service Date",

    // Depreciation section
    depreciation: "Depreciation",
    depreciationMethod: "Method",
    usefulLife: "Useful Life",
    convention: "Convention",
    depreciationRate: "Depreciation Rate",

    // Location & Assignment
    locationAssignment: "Location & Assignment",
    physicalLocation: "Physical Location",

    // Supplier section
    supplierPurchase: "Supplier & Purchase",
    supplier: "Supplier",
    invoiceNumber: "Invoice Number",
    purchaseDocument: "Purchase Document",
    supplierSerialNumber: "Supplier Serial Number",

    // Observations
    observations: "Observations",

    // Photo & Barcode
    photo: "Photo",
    assetBarcode: "Asset Barcode",
    printBarcode: "Print Barcode",
    regenerateBarcode: "Regenerate Barcode",
    noBarcode: "No barcode generated yet",
    generateBarcode: "Generate Barcode",
    generating: "Generating...",
    regenerating: "Regenerating...",

    // Quick stats
    quickStats: "Quick Stats",
    age: "Age",
    remainingLife: "Remaining Life",
    years: "years",

    // New asset form
    addNewAsset: "Add New Fixed Asset",
    addNewAssetSubtitle: "Enter comprehensive details for the new asset",
    assetPhoto: "Asset Photo",
    clickToSelect: "Click to select photo",
    uploadPhoto: "Upload Photo",
    uploading: "Uploading...",
    photoUploaded: "✓ Photo uploaded successfully",
    removePhoto: "Remove and upload different photo",

    // Form sections
    assetTag: "Asset Tag / ID",
    assetTagPlaceholder: "e.g., COMP-HQ-001",
    assetTagRequired: "Asset tag is required",
    assetName: "Asset Name",
    assetNamePlaceholder: "e.g., Dell Laptop XPS 15",
    assetNameRequired: "Name is required",
    descriptionPlaceholder: "Detailed description of the asset...",
    categoryRequired: "Category is required",
    categoryPlaceholder: "e.g., Computer Equipment",

    // Organizational structure
    organizationalStructure: "Organizational Structure",
    selectBranch: "Select branch...",
    selectDepartment: "Select department...",
    selectAssetType: "Select asset type...",
    classCode: "Class/Type Code",
    classCodePlaceholder: "e.g., COMP",
    costCenterCode: "Cost Center Code",
    costCenterCodePlaceholder: "e.g., CC-100",
    areaCode: "Area Code",
    areaCodePlaceholder: "e.g., AREA-01",

    // Asset identification
    assetIdentification: "Asset Identification",
    serialNumberInternal: "Serial Number",
    serialNumberPlaceholder: "Internal serial number",
    seriesNumber: "Series Number",
    seriesNumberPlaceholder: "Series number",
    supplierSerialNumberPlaceholder: "Supplier/manufacturer serial number",

    // Supplier & Purchase
    supplierPurchaseInfo: "Supplier & Purchase Information",
    supplierPlaceholder: "Supplier name",
    invoiceNumberPlaceholder: "e.g., INV-2024-001",
    purchaseDocumentPlaceholder: "e.g., PO-2024-001",
    unitCost: "Unit Cost",
    quantity: "Quantity",
    quantityPlaceholder: "1",
    currency: "Currency",
    currencyPlaceholder: "USD",

    // Financial info form
    acquisitionCostPlaceholder: "0.00",
    acquisitionCostRequired: "Must be non-negative",
    currentValuePlaceholder: "0.00",
    currentValueRequired: "Must be non-negative",
    residualValuePlaceholder: "0.00",

    // Depreciation settings
    depreciationSettings: "Depreciation Settings",
    straightLine: "Straight Line",
    decliningBalance: "Declining Balance",
    unitsOfProduction: "Units of Production",
    sumOfYearsDigits: "Sum of Years Digits",
    halfYear: "Half Year",
    fullYear: "Full Year",
    midMonth: "Mid Month",
    usefulLifeYears: "Useful Life (Years)",
    usefulLifePlaceholder: "e.g., 5",
    depreciationPercentage: "Depreciation Percentage",
    depreciationPercentagePlaceholder: "e.g., 20",
    depreciationStartDate: "Depreciation Start Date",

    // Accounting
    accountingInformation: "Accounting Information",
    assetAccountNumber: "Asset Account Number",
    assetAccountPlaceholder: "e.g., 1500",
    accumulatedDepreciationAccount: "Accumulated Depreciation Account",
    accumulatedDepreciationPlaceholder: "e.g., 1510",
    depreciationExpenseAccount: "Depreciation Expense Account",
    depreciationExpensePlaceholder: "e.g., 6300",
    fixedAssetLedger: "Fixed Asset Ledger/Module",
    fixedAssetLedgerPlaceholder: "e.g., FA-01",

    // Physical details
    physicalDetailsLocation: "Physical Details & Location",
    manufacturerPlaceholder: "e.g., Dell",
    modelPlaceholder: "e.g., XPS 15",
    selectLocation: "Select location...",

    // Components
    assetComponents: "Asset Components",
    component1: "Component 1",
    component1Placeholder: "e.g., Monitor",
    component2: "Component 2",
    component2Placeholder: "e.g., Keyboard",
    component3: "Component 3",
    component3Placeholder: "e.g., Mouse",

    // Assignment
    assignmentResponsibility: "Assignment & Responsibility",
    personResponsible: "Person Responsible / User",
    custodyCertificateDetails: "Custody Certificate Details",
    custodyCertificateMessage:
      "Complete the following information to formalize the custody assignment",
    fixedAssetCode: "Fixed Asset Code / Plate Number",
    fixedAssetCodePlaceholder: "Will default to Asset Tag if not provided",
    briefDescription: "Brief Description of Asset",
    briefDescriptionPlaceholder: "Brief description for custody purposes...",
    initialCondition: "Initial Condition",
    initialConditionPlaceholder:
      "Describe the condition of the asset at the time of assignment...",
    maintenanceObligations: "Maintenance Obligations",
    maintenanceObligationsPlaceholder:
      "Describe maintenance responsibilities and conditions of use...",

    // Activity & Project
    activityProject: "Activity & Project",
    activityProjectLink: "Activity or Project Link",
    activityProjectPlaceholder: "e.g., Project XYZ, Department Initiative",

    // Additional observations
    additionalObservations: "Additional Observations",
    observationsPlaceholder:
      "Enter any special conditions, warranty information, restrictions, or other important notes...",

    // Actions
    creating: "Creating...",
    createAsset: "Create Asset",

    // Messages
    assetCreated: "Asset created successfully!",
    failedToCreate: "Failed to create asset",
    failedToLoad: "Failed to load assets",
    barcodeGenerated: "Barcode generated successfully!",
    failedToGenerateBarcode: "Failed to generate barcode",
    noBarcodeToPrint: "No barcode available to print",

    // Hints and labels
    uniqueIdentifier: "(Unique identifier)",
    exampleName: "(e.g., Dell Laptop)",
    originalValue: "(Original value)",
    depreciableValue: "(Depreciable value)",
    salvageValue: "(Salvage value)",
    datePutIntoService: "(Date put into service)",
    accountingLabel: "(Accounting)",
    legacyField: "(Legacy field)",
    internalLabel: "(Internal)",
    manufacturerSN: "(Manufacturer's S/N)",
    contractPO: "(Contract/PO #)",
    forIdenticalItems: "(For identical items)",
    specialConditions: "(Special conditions, guarantees, restrictions)",
  },

  // Finance
  finance: {
    title: "Finance & Analytics",
    subtitle:
      "Comprehensive asset portfolio analysis and depreciation tracking",

    // Tabs
    assetDistribution: "Asset Distribution",
    depreciationSchedule: "Depreciation Schedule",
    valueTrends: "Value Trends",

    // Time range
    timeRange: "Time Range",
    sixMonths: "6 Months",
    twelveMonths: "12 Months",
    twentyFourMonths: "24 Months",
    thirtySixMonths: "36 Months",

    // Loading states
    loadingFinancialData: "Loading financial data...",
    failedToLoadData: "Failed to load financial data",
    tryRefreshing: "Please try refreshing the page.",

    // Asset Distribution Chart
    totalAssets: "Total Assets",
    totalValue: "Current Value",
    totalAcquisitionCost: "Acquisition Cost",
    totalDepreciation: "Depreciation",
    assetsByCategory: "Assets by Category",
    valueByCategory: "Value by Category",
    assetsByStatus: "Assets by Status",
    topLocationsByValue: "Top Locations by Value",
    categoryBreakdown: "Category Breakdown",
    count: "Count",

    // Depreciation Chart
    latestBookValue: "Latest Book Value",
    accumulatedDepreciation: "Accumulated Depreciation",
    monthlyDepreciation: "Monthly Depreciation",
    vsPreviousMonth: "vs previous month",
    bookValueOverTime: "Book Value Over Time",
    depreciationTrends: "Depreciation Trends",
    bookValue: "Book Value",
    period: "Period",
    assets: "Assets",
    accumulated: "Accumulated",
    noDepreciationData:
      "No depreciation data available. Depreciation calculations will appear here once assets are depreciated.",

    // Value Trends Chart
    currentPortfolioValue: "Current Portfolio Value",
    originalInvestment: "Original investment",
    ofCost: "of cost",
    activeAssets: "Active assets",
    portfolioValueTrend: "Portfolio Value Trend",
    ofPortfolio: "of portfolio",
    acquisition: "Acquisition",
    depreciated: "Depreciated",
    noTrendData:
      "No trend data available. Asset value trends will appear here once depreciation calculations are performed.",
  },

  // Reports
  reports: {
    title: "Asset Reports",
    subtitle:
      "Generate comprehensive reports with advanced filtering and export capabilities",

    // Export buttons
    exportCSV: "Export CSV",
    exportPDF: "Export PDF",
    exportExcel: "Export Excel",
    exporting: "Exporting...",
    generating: "Generating...",

    // Filters (reuse some from assets)
    filters: "Filters",
    clearAll: "Clear All",
    search: "Search",
    searchPlaceholder: "Name or tag...",
    status: "Status",
    allStatuses: "All Statuses",
    branch: "Branch",
    allBranches: "All Branches",
    department: "Department",
    allDepartments: "All Departments",
    assetType: "Asset Type",
    allTypes: "All Types",
    assetClass: "Asset Class",
    allClasses: "All Classes",
    location: "Location",
    allLocations: "All Locations",
    custodian: "Custodian",
    allCustodians: "All Custodians",
    startDate: "Start Date",
    endDate: "End Date",

    // Summary stats
    totalAssets: "Total Assets",
    totalValue: "Total Value",
    acquisitionCost: "Acquisition Cost",

    // Table headers
    asset: "Asset",
    typeClass: "Type/Class",
    value: "Value",
    branchDept: "Branch/Dept",
    acquisitionDate: "Acquisition Date",
    cost: "Cost",

    // Empty state
    noAssetsFound: "No assets found",
    adjustFilters: "Try adjusting your filters to see more results.",

    // Messages
    reportGenerated: "Report generated successfully!",
    assetsExported: "assets exported.",
    failedToExport: "Failed to export report:",
    pdfGenerated: "PDF report generated successfully!",
    failedToGeneratePDF: "Failed to generate PDF:",
    excelGenerated: "Excel report generated successfully!",
    failedToExportExcel: "Failed to export Excel:",
    loadingAssets: "Loading assets...",
    failedToLoad: "Failed to load assets",

    // PDF View
    assetReport: "Asset Report",
    generated: "Generated:",
    periodLabel: "Period:",
    loadingReport: "Loading report...",
    errorLoadingReport: "Error loading report",
    noAssetsMatching: "No assets found matching the selected filters.",
    assetTag: "Asset Tag",
    name: "Name",
    currentValue: "Current Value",
    unassigned: "Unassigned",
    reportContains: "This report contains",
    assetSingular: "asset",
    assetPlural: "assets",
    withTotalValue: "with a total current value of",
    confidential: "Confidential",
  },

  // Dashboard
  dashboard: {
    title: "Dashboard",
    welcomeBack: "Welcome back! Here's an overview of your assets.",

    // Admin dashboard
    admin: {
      title: "Admin Dashboard",
      welcomeMessage: "Welcome back! Here's an overview of your assets.",
      totalAssets: "Total Assets",
      totalValue: "Total Value",
      activeAssets: "Active Assets",
      inRepair: "In Repair",
      acquisitionCost: "Acquisition Cost",
      totalDepreciation: "Total Depreciation",
      quickActions: "Quick Actions",
      addAsset: "Add Asset",
      generateReport: "Generate Report",
      scheduleMaintenance: "Schedule Maintenance",
      startCounting: "Start Counting",
      assetsByStatus: "Assets by Status",
      recentActivity: "Recent Activity",
      topCategories: "Top Categories",
      depreciationAlerts: "Depreciation Alerts",
      upcomingMaintenance: "Upcoming Maintenance",
      noRecentActivity: "No recent activity",
      noUpcomingMaintenance: "No upcoming maintenance scheduled",
    },

    // Employee dashboard
    employee: {
      title: "My Dashboard",
      subtitle: "View your assigned assets and responsibilities.",
      myAssets: "My Assets",
      totalValue: "Total Value",
      workOrders: "Work Orders",
      recentTransfers: "Recent Transfers",
      myAssignedAssets: "My Assigned Assets",
      upcomingMaintenance: "Upcoming Maintenance",
      recentActivity: "Recent Activity",
      noAssetsAssigned: "No assets assigned to you",
      noWorkOrders: "No work orders assigned to you",
      noRecentTransfers: "No recent transfers",
      noUpcomingMaintenance: "No upcoming maintenance",
      noRecentActivity: "No recent activity",
      viewAll: "View All",
      from: "From",
      to: "To",
      due: "Due",
      assignedToMe: "Assigned to Me",
      assetCondition: "Asset Condition",
      maintenanceReminders: "Maintenance Reminders",
    },

    failedToLoad: "Failed to load dashboard data",
  },

  // Inventory
  inventory: {
    title: "Inventory Management",
    subtitle:
      "Comprehensive tools for physical inventory, asset scanning, and bulk operations",

    // Features
    scanningAssets: "Scanning Assets",
    scanningDescription:
      "Use QR codes to quickly verify asset locations and conditions during physical inventory",
    bulkPrintLabels: "Bulk Print Labels",
    bulkPrintDescription:
      "Generate and print barcode labels for multiple assets at once",
    transferProcesses: "Transfer Processes",
    transferDescription:
      "Manage asset transfers between locations, branches, or custodians",
    initialInventory: "Initial Inventory",
    initialInventoryDescription:
      "Set up your initial asset inventory with bulk import capabilities",

    // Scan page
    scanTitle: "Scan Assets",
    scanSubtitle: "Scan asset QR codes to verify location and condition",
    scanningTips: "Scanning Tips",
    tip1: "Ensure good lighting for best results",
    tip2: "Hold camera steady and focus on the QR code",
    tip3: "Codes should be clean and undamaged",
    assetDetails: "Asset Details",
    verifyLocation: "Verify Location",
    updateCondition: "Update Condition",
    assetFound: "Asset Found",
    assetNotFound: "Asset not found",
    readyToScan: "Ready to Scan",
    enterAssetTag: "Enter an asset tag or scan a QR code to get started",
    viewFullDetails: "View Full Asset Details",
    scan: "Scan",

    // Bulk print
    bulkPrintTitle: "Bulk Print Labels",
    bulkPrintSubtitle: "Select assets and print barcode labels",
    selectAssets: "Select Assets",
    printSelected: "Print Selected",
    selectedCount: "Selected",
    selectAtLeastOne: "Please select at least one asset to print",
    noAssetsSelected: "No assets selected",

    // Transfers
    transfersTitle: "Transfer Processes",
    transfersSubtitle: "Manage asset transfers",
    newTransfer: "New Transfer",
    transferType: "Transfer Type",
    allTypes: "All Types",
    locationTransfer: "Location Transfer",
    custodianTransfer: "Custodian Transfer",
    branchTransfer: "Branch Transfer",
    transferStatus: "Status",
    allStatuses: "All Statuses",
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",

    // New transfer
    newTransferTitle: "New Transfer Process",
    newTransferSubtitle: "Create a new asset transfer",
    createNewTransfer: "Create New Transfer",
    initiateTransferMessage:
      "Initiate a new asset transfer or reception process",
    transferDetails: "Transfer Details",
    processType: "Process Type",
    transfer: "Transfer",
    reception: "Reception",
    defaultLocation: "Default Location",
    defaultLocationOptional: "Default Location (Optional)",
    selectLocation: "Select location...",
    notes: "Notes",
    notesPlaceholder: "Add any notes about this transfer process...",
    assetsToTransfer: "Assets to Transfer",
    addAssetsMessage: "Add assets and specify their source and destination",
    addAsset: "Add Asset",
    noAssetsAdded: "No assets added yet",
    addFirstAsset: "Add First Asset",
    assetNumber: "Asset #",
    asset: "Asset",
    selectAsset: "Select an asset...",
    fromLocation: "From Location",
    toLocation: "To Location",
    fromCustodian: "From Custodian",
    toCustodian: "To Custodian",
    notSpecified: "Not specified",
    notesForAsset: "Notes for this asset",
    optionalNotes: "Optional notes...",
    creating: "Creating...",
    createTransfer: "Create Transfer",
    transferCreated: "Transfer process created successfully!",
    failedToCreate: "Failed to create transfer",
    atLeastOneAsset: "At least one asset must be added",
    assetRequired: "Asset is required",

    // Transfer detail
    backToTransfers: "Back to Transfers",
    transferDetail: "Transfer Details",
    transferInformation: "Transfer Information",
    totalAssets: "Total Assets",
    assetSingular: "asset",
    assetPlural: "assets",
    assetMovements: "Asset Movements",
    noAssetsInTransfer: "No assets in this transfer",
    from: "FROM",
    to: "TO",
    movementDate: "Movement date:",
    completeTransfer: "Complete Transfer",
    cancelTransfer: "Cancel Transfer",
    completing: "Completing...",
    confirmComplete:
      "Are you sure you want to complete this transfer? This will update all asset locations and custodians.",
    confirmCancel:
      "Are you sure you want to cancel this transfer? No changes will be made to the assets.",
    transferCompleted: "Transfer completed successfully!",
    failedToComplete: "Failed to complete transfer",
    transferCancelled: "Transfer cancelled",
    failedToCancel: "Failed to cancel transfer",
    loadingTransferDetails: "Loading transfer details...",
    transferNotFound: "Transfer not found",
    started: "Started:",
    ended: "Ended:",
    movementSummary: "Movement Summary:",

    // Transfers list
    backToInventory: "Back to Inventory",
    transfersAndReception: "Transfers & Reception",
    trackMovements: "Track asset movements with full audit trails",
    loadingTransfers: "Loading transfers...",
    noTransfersFound: "No transfers found",
    createFirstTransfer:
      "Create your first transfer to start tracking asset movements.",

    // Initial inventory
    initialInventoryTitle: "Initial Inventory - Bulk Import",
    bulkImportSubtitle:
      "Import multiple assets from a CSV or Excel file to quickly populate your asset database",
    importInstructions: "Import Instructions",
    instruction1: "Download the CSV template to see the required format",
    instruction2:
      "Fill in your asset data following the template structure (CSV or Excel format)",
    instruction3:
      "Required fields: assetTag, name, category, acquisitionCost, currentValue, acquisitionDate",
    instruction4: "Upload your completed CSV or Excel file",
    instruction5: "Review the parsed data and click Import",
    csvTemplate: "CSV Template",
    downloadTemplate:
      "Download a template file with all required and optional columns (compatible with Excel)",
    downloadTemplateButton: "Download Template",
    uploadFile: "Upload File",
    clickToSelectFile: "Click to select CSV or Excel file",
    parseFile: "Parse File",
    parsing: "Parsing...",
    dataPreview: "Data Preview",
    assetsCount: "assets",
    importing: "Importing...",
    importAssets: "Import Assets",
    importResults: "Import Results",
    totalProcessed: "Total Processed",
    successful: "Successful",
    failed: "Failed",
    errors: "Errors",
    row: "Row",
    viewAssets: "View Assets",
    importMoreAssets: "Import More Assets",
    parsedAssets: "Parsed {count} assets from file",
    failedToParse: "Failed to parse file",
    selectCsvOrExcel: "Please select a CSV or Excel file",
    showingFirst: "Showing first 10 of {count} assets",
    assetTag: "Asset Tag",
    name: "Name",
    category: "Category",
    acquisitionCost: "Acquisition Cost",
    currentValue: "Current Value",
    acquisitionDate: "Acquisition Date",
  },

  // Custodians
  custodians: {
    title: "Custodians",
    subtitle: "Manage asset custodians and their assignments",
    searchPlaceholder: "Search custodians...",
    name: "Name",
    email: "Email",
    assignedAssets: "Assigned Assets",
    totalValue: "Total Value",
    noCustodiansFound: "No custodians found",
    editCustodianDetails: "Edit Custodian Details",
    detailsUpdated: "Custodian details updated successfully",
    failedToUpdate: "Failed to update custodian details",

    // Detail page
    custodianDetails: "Custodian Details",
    printCertificate: "Print Certificate",
    downloadPDF: "Download PDF",
    custodianInformation: "Custodian Information",
    assetsUnderCustody: "Assets Under Custody",
    acknowledgment: "Acknowledgment",
    acknowledgmentText:
      "I acknowledge receipt of the above-listed assets and agree to maintain them in good condition according to company policies.",
  },

  // Maintenance
  maintenance: {
    title: "Maintenance",
    subtitle: "Track and manage asset maintenance schedules and history",
    comingSoon: "Coming Soon",
    description:
      "Comprehensive maintenance tracking features will be available soon, including:",
    feature1: "Preventive maintenance scheduling",
    feature2: "Work order management",
    feature3: "Maintenance history tracking",
    feature4: "Service provider management",
    feature5: "Cost tracking and analysis",
  },
} as const;
