export const es = {
  // Common
  common: {
    loading: "Cargando...",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    search: "Buscar",
    filter: "Filtrar",
    actions: "Acciones",
    yes: "Sí",
    no: "No",
    confirm: "Confirmar",
    back: "Atrás",
    next: "Siguiente",
    previous: "Anterior",
    submit: "Enviar",
    close: "Cerrar",
    saveChanges: "Guardar Cambios",
    saving: "Guardando...",
    required: "Requerido",
    acknowledge: "Reconocer",
    searchPlaceholder: "Buscar...",
    download: "Descargar",
    count: "Cantidad",
    value: "Valor",
    more: "más",
    showing: "Mostrando",
    of: "de",
    selectLanguage: "Seleccionar Idioma",
    none: "Ninguno",
    optional: "Opcional",
    update: "Actualizar",
    retry: "Reintentar",
  },

  // Status labels
  status: {
    active: "Activo",
    inRepair: "En Reparación",
    disposed: "Desechado",
    stolen: "Robado",
    lost: "Perdido",
  },

  // Authentication
  auth: {
    welcomeBack: "Bienvenido de Nuevo",
    signInMessage: "Inicia sesión en tu cuenta para continuar",
    emailAddress: "Dirección de Correo Electrónico",
    password: "Contraseña",
    signIn: "Iniciar Sesión",
    signingIn: "Iniciando sesión...",
    dontHaveAccount: "¿No tienes una cuenta?",
    createOneNow: "Crea una ahora",
    createAccount: "Crear Cuenta",
    startTrialMessage: "Comienza tu prueba gratuita hoy",
    firstName: "Nombre",
    lastName: "Apellido",
    companyName: "Nombre de la Empresa",
    creatingAccount: "Creando cuenta...",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    signInLink: "Iniciar sesión",
    logout: "Cerrar Sesión",
    invalidEmail: "Dirección de correo electrónico inválida",
    passwordRequired: "La contraseña es requerida",
    passwordMinLength: "La contraseña debe tener al menos 8 caracteres",
    firstNameRequired: "El nombre es requerido",
    lastNameRequired: "El apellido es requerido",
    companyNameRequired: "El nombre de la empresa es requerido",
  },

  // Navigation
  nav: {
    dashboard: "Panel de Control",
    assets: "Activos",
    finance: "Finanzas",
    reports: "Informes",
    maintenance: "Mantenimiento",
    inventory: "Inventario",
    custodians: "Custodios",
    settings: "Configuración",
  },

  // App
  app: {
    assetMaster: "AssetMaster",
    tagline: "Gestiona Tus Activos Con Confianza",
    description:
      "Gestión integral de activos fijos y seguimiento de mantenimiento para empresas modernas.",
    copyright: "© 2026 AssetMaster Web. Todos los derechos reservados.",
    startManaging: "Comienza a Gestionar Tus Activos Hoy",
    joinThousands:
      "Únete a miles de empresas que usan AssetMaster para rastrear, mantener y optimizar sus activos fijos.",
  },

  // Settings
  settings: {
    title: "Configuración",
    description:
      "Configura tu sistema AssetMaster, gestiona usuarios y personaliza tu experiencia.",
    backToSettings: "Volver a Configuración",
    location: "Nueva Ubicación",

    // Company Settings
    company: {
      title: "Configuración de la Empresa",
      description: "Gestiona la información y preferencias de tu empresa",
      companyInformation: "Información de la Empresa",
      companyName: "Nombre de la Empresa",
      companyNamePlaceholder: "Ingresa el nombre de la empresa",
      companyNameRequired: "El nombre de la empresa es requerido",
      companyId: "ID de la Empresa",
      companyIdDescription: "Este es tu identificador único de empresa",
      accountCreated: "Cuenta Creada",

      // Branding
      branding: "Marca",
      companyLogo: "Logo de la Empresa",
      clickToSelectLogo: "Haz clic para seleccionar el logo",
      logoFileTypes: "PNG, JPG hasta 5MB",
      uploading: "Subiendo...",
      uploadLogo: "Subir Logo",
      logoUploaded: "✓ Logo subido",
      removeLogo: "Eliminar y subir un logo diferente",
      brandColor: "Color de Marca",
      brandColorDescription:
        "Elige un color primario para tu marca (formato hexadecimal)",
      brandColorPlaceholder: "#3B82F6",
      invalidHexColor: "Debe ser un color hexadecimal válido (ej., #3B82F6)",

      // Regional Settings
      regionalSettings: "Configuración Regional",
      defaultCurrency: "Moneda Predeterminada",
      currencyRequired: "La moneda es requerida",
      defaultLanguage: "Idioma Predeterminado",
      languageRequired: "El idioma es requerido",
      defaultTimezone: "Zona Horaria Predeterminada",
      selectTimezone: "Selecciona zona horaria...",

      // Email Notifications
      emailNotifications: "Notificaciones por Correo Electrónico",
      enableEmailNotifications:
        "Habilitar Notificaciones por Correo Electrónico",
      emailNotificationsDescription:
        "Recibe alertas por correo electrónico para eventos importantes del sistema",
      notificationEmail: "Dirección de Correo de Notificaciones",
      notificationEmailPlaceholder: "notificaciones@empresa.com",
      notificationEmailDescription:
        "Dirección de correo electrónico donde se enviarán las notificaciones del sistema",
      invalidEmailAddress: "Debe ser un correo electrónico válido",

      // API Access
      apiAccess: "Acceso a API e Integraciones",
      apiKey: "Clave de API",
      noApiKeyGenerated: "No se ha generado clave de API",
      apiKeyDescription:
        "Usa esta clave para autenticar solicitudes de API. Manténla segura y no la compartas públicamente.",
      apiDocumentation: "Documentación de API",
      apiDocumentationDescription:
        "Los endpoints de API y las guías de integración estarán disponibles pronto. La clave de API anterior se utilizará para autenticar tus solicitudes.",

      // Messages
      updateSuccess: "Configuración de la empresa actualizada exitosamente",
      updateError: "Error al actualizar la configuración de la empresa",
      uploadSuccess: "¡Logo subido exitosamente!",
      uploadError: "Error al subir el logo",
      selectImageFile: "Por favor selecciona un archivo de imagen",
      fileSizeError: "El tamaño del archivo debe ser menor a 5MB",
      apiKeyGenerated: "Nueva clave de API generada",
      apiKeyCopied: "Clave de API copiada al portapapeles",
      failedToLoad: "Error al cargar la configuración de la empresa",
      retry: "Reintentar",
    },

    // Locations
    locations: {
      title: "Ubicaciones Físicas",
      subtitle:
        "Gestiona ubicaciones físicas donde se almacenan o usan los activos",
      addLocation: "Agregar Ubicación",
      editLocation: "Editar Ubicación",
      locationName: "Nombre de la Ubicación",
      locationNamePlaceholder: "ej., Almacén Principal",
      locationNameRequired: "El nombre de la ubicación es requerido",
      locationType: "Tipo de Ubicación",
      locationTypes: {
        WAREHOUSE: "Almacén",
        OFFICE: "Oficina",
        RETAIL: "Retail",
        BUILDING: "Edificio",
        ROOM: "Habitación",
        FLOOR: "Piso",
        DEPARTMENT: "Departamento",
        STORAGE: "Área de Almacenamiento",
        FACILITY: "Instalación",
        OTHER: "Otro",
      },
      selectType: "Selecciona tipo...",
      address: "Dirección",
      addressPlaceholder: "Dirección completa...",
      locationCreated: "Ubicación creada exitosamente",
      locationUpdated: "Ubicación actualizada exitosamente",
      locationDeleted: "Ubicación eliminada exitosamente",
      deleteConfirm: "¿Estás seguro de que quieres eliminar esta ubicación?",
      newLocation: "Nueva Ubicación",
      noLocations: "Aún no hay ubicaciones",
      locationTypeRequired: "El tipo de ubicación es requerido",
      noLocationsAssigned: "No hay ubicaciones asignadas a esta sucursal",
    },

    // Branches
    branches: {
      title: "Sucursales",
      subtitle:
        "Gestiona sucursales de la empresa con códigos únicos para identificación de activos",
      createBranch: "Crear Sucursal",
      addBranch: "Agregar Sucursal",
      newBranch: "Nueva Sucursal",
      editBranch: "Editar Sucursal",
      branchCode: "Código de Sucursal *",
      branchCodeNumerical: "(Código numérico)",
      branchCodePlaceholder: "ej., 01",
      branchCodeRequired: "El código de sucursal es requerido",
      branchName: "Nombre de Sucursal *",
      branchNamePlaceholder: "ej., Oficina Central",
      branchNameRequired: "El nombre de sucursal es requerido",
      address: "Dirección",
      addressPlaceholder: "ej., Calle Principal 123, Ciudad, Estado 12345",
      branchCreated: "¡Sucursal creada exitosamente!",
      branchUpdated: "¡Sucursal actualizada exitosamente!",
      branchDeleted: "¡Sucursal eliminada exitosamente!",
      failedToCreate: "Error al crear sucursal",
      failedToUpdate: "Error al actualizar sucursal",
      failedToDelete: "Error al eliminar sucursal",
      deleteConfirm:
        "¿Estás seguro de que quieres eliminar esta sucursal? Esta acción no se puede deshacer.",
      noBranches: "Aún no hay sucursales",
      createFirst: "Crea tu primera sucursal",
      loading: "Cargando sucursales...",
      code: "Código",
      name: "Nombre",
      departments: "Departamentos",
      assets: "Activos",
      noAddress: "Sin dirección",
      createBranch: "Crear Sucursal",
      updateBranch: "Actualizar Sucursal",
    },

    // Departments
    departments: {
      title: "Departamentos",
      subtitle:
        "Organiza departamentos por sucursal con códigos únicos para seguimiento de activos",
      addDepartment: "Agregar Departamento",
      newDepartment: "Nuevo Departamento",
      editDepartment: "Editar Departamento",
      selectBranch: "Selecciona sucursal...",
      branchRequired: "La sucursal es requerida",
      branch: "Sucursal *",
      departmentHead: "Jefe de Departamento",
      noDepartmentHead: "Sin jefe de departamento",
      departmentCode: "Código de Departamento *",
      departmentCodeNumerical: "(Numérico)",
      departmentCodePlaceholder: "ej., 01",
      departmentCodeRequired: "El código de departamento es requerido",
      departmentName: "Nombre de Departamento *",
      departmentNamePlaceholder: "ej., Recursos Humanos",
      departmentNameRequired: "El nombre de departamento es requerido",
      departmentCreated: "¡Departamento creado exitosamente!",
      departmentUpdated: "¡Departamento actualizado exitosamente!",
      departmentDeleted: "¡Departamento eliminado exitosamente!",
      failedToCreate: "Error al crear departamento",
      failedToUpdate: "Error al actualizar departamento",
      failedToDelete: "Error al eliminar departamento",
      deleteConfirm:
        "¿Estás seguro de que quieres eliminar este departamento? Esta acción no se puede deshacer.",
      noDepartments: "Aún no hay departamentos",
      createFirst: "Crea tu primer departamento",
      createBranchFirst:
        "Crea primero una sucursal para agregar departamentos.",
      pleaseCreateBranch:
        "Por favor crea al menos una sucursal antes de agregar departamentos.",
      loading: "Cargando departamentos...",
      code: "Código",
      name: "Nombre",
      notAssigned: "No asignado",
    },

    // Asset Types
    assetTypes: {
      title: "Tipos de Activos",
      subtitle:
        "Define categorías de tipos de activos (Maquinaria, Mobiliario, Vehículos, etc.) con códigos",
      addAssetType: "Agregar Tipo de Activo",
      newAssetType: "Nuevo Tipo de Activo",
      editAssetType: "Editar Tipo de Activo",
      typeCode: "Código de Tipo de Activo *",
      typeCodeNumerical: "(Código numérico)",
      typeCodePlaceholder: "ej., 01",
      typeCodeRequired: "El código de tipo de activo es requerido",
      typeName: "Nombre de Tipo de Activo *",
      typeNamePlaceholder: "ej., Maquinaria y Equipo",
      typeNameRequired: "El nombre de tipo de activo es requerido",
      acronym: "Acrónimo",
      acronymPlaceholder: "ej., MAQ",
      accountingAccount: "Cuenta Contable",
      accountingAccountPlaceholder: "ej., 1520",
      depreciableAssetType: "Tipo de Activo Depreciable",
      depreciableHelper:
        "Habilitar si los activos de este tipo deben ser depreciados",
      suggestedTypes: "Tipos de Activos Sugeridos",
      suggestedHelper:
        "Categorías comunes de tipos de activos que podrías querer agregar:",
      machinery: "01 - Maquinaria y Equipo",
      furniture: "02 - Mobiliario y Accesorios",
      technology: "03 - Equipo Tecnológico",
      vehicles: "04 - Vehículos",
      electronics: "Electrónicos",
      assetTypeCreated: "¡Tipo de activo creado exitosamente!",
      assetTypeUpdated: "¡Tipo de activo actualizado exitosamente!",
      assetTypeDeleted: "¡Tipo de activo eliminado exitosamente!",
      failedToCreate: "Error al crear tipo de activo",
      failedToUpdate: "Error al actualizar tipo de activo",
      failedToDelete: "Error al eliminar tipo de activo",
      deleteConfirm:
        "¿Estás seguro de que quieres eliminar este tipo de activo? Esta acción no se puede deshacer.",
      noAssetTypes: "Aún no hay tipos de activos",
      createFirst: "Crea tu primer tipo de activo",
      loading: "Cargando tipos de activos...",
      code: "Código",
      name: "Nombre",
      account: "Cuenta",
      depreciable: "Depreciable",
      assets: "Activos",
      yes: "Sí",
      no: "No",
    },

    // Asset Classes
    assetClasses: {
      title: "Clases de Activos",
      subtitle:
        "Define clases de activos vinculadas a tipos de activos con detalles contables",
      addClass: "Agregar Clase de Activo",
      newAssetClass: "Nueva Clase de Activo",
      editClass: "Editar Clase de Activo",
      selectAssetType: "Selecciona tipo de activo...",
      assetTypeRequired: "El tipo de activo es requerido",
      assetType: "Tipo de Activo *",
      classCode: "Código de Clase *",
      classCodePlaceholder: "ej., 01",
      classCodeRequired: "El código de clase es requerido",
      classDescription: "Descripción *",
      classDescriptionPlaceholder: "ej., Maquinaria Pesada",
      classDescriptionRequired: "La descripción es requerida",
      budgetCode: "Código de Presupuesto",
      budgetCodePlaceholder: "ej., PRES-2024-001",
      accountNumber: "Cuenta Contable",
      accountNumberPlaceholder: "ej., 1520-01",
      classCreated: "¡Clase de activo creada exitosamente!",
      classUpdated: "¡Clase de activo actualizada exitosamente!",
      classDeleted: "¡Clase de activo eliminada exitosamente!",
      failedToCreate: "Error al crear clase de activo",
      failedToUpdate: "Error al actualizar clase de activo",
      failedToDelete: "Error al eliminar clase de activo",
      deleteConfirm:
        "¿Estás seguro de que quieres eliminar esta clase de activo? Esta acción no se puede deshacer.",
      noAssetClasses: "Aún no hay clases de activos",
      createFirst: "Crea tu primera clase de activo",
      createAssetTypeFirst:
        "Crea primero un tipo de activo para agregar clases de activos.",
      pleaseCreateAssetType:
        "Por favor crea al menos un tipo de activo antes de agregar clases de activos.",
      loading: "Cargando clases de activos...",
      description: "Descripción",
      subclasses: "Subclases",
      assetClass: "Clase de Activo",
      accountingAccount: "Cuenta Contable",
      updateAssetClass: "Actualizar Clase de Activo",
      createAssetClass: "Crear Clase de Activo",
    },

    // Asset Subclasses
    assetSubclasses: {
      title: "Subclases de Activos",
      subtitle:
        "Gestiona subclases de activos para categorización detallada dentro de cada clase de activo",
      addSubclass: "Agregar Subclase de Activo",
      newSubclass: "Nueva Subclase de Activo",
      editSubclass: "Editar Subclase de Activo",
      selectAssetClass: "Selecciona clase de activo...",
      assetClassRequired: "La clase de activo es requerida",
      assetClass: "Clase de Activo *",
      subclassCode: "Código de Subclase",
      subclassCodePlaceholder: "ej., LAP-EMP",
      subclassCodeRequired: "El código de subclase es requerido",
      subclassDescription: "Descripción *",
      subclassDescriptionPlaceholder: "ej., Excavadoras",
      subclassDescriptionRequired: "La descripción es requerida",
      abbreviation: "Abreviatura",
      abbreviationPlaceholder: "ej., EXC",
      subclassCreated: "¡Subclase de activo creada exitosamente!",
      subclassUpdated: "¡Subclase de activo actualizada exitosamente!",
      subclassDeleted: "¡Subclase de activo eliminada exitosamente!",
      failedToCreate: "Error al crear subclase de activo",
      failedToUpdate: "Error al actualizar subclase de activo",
      failedToDelete: "Error al eliminar subclase de activo",
      deleteConfirm:
        "¿Estás seguro de que quieres eliminar esta subclase de activo? Esta acción no se puede deshacer.",
      noSubclasses: "Aún no hay subclases de activos",
      createFirst: "Crea tu primera subclase de activo",
      createAssetClassFirst:
        "Crea primero una clase de activo para agregar subclases de activos.",
      pleaseCreateAssetClass:
        "Por favor crea al menos una clase de activo antes de agregar subclases de activos.",
      loading: "Cargando subclases de activos...",
      description: "Descripción",
      assetType: "Tipo de Activo",
    },

    // Labels
    labels: {
      title: "Configuración de Etiquetas",
      subtitle:
        "Personaliza el diseño, tamaño y la información mostrada en las etiquetas de código de barras",
      labelConfiguration: "Configuración de Etiquetas",
      labelDimensions: "Dimensiones de Etiqueta",
      width: "Ancho",
      height: "Alto",
      unit: "Unidad",
      millimeters: "Milímetros (mm)",
      inches: "Pulgadas",
      layoutConfiguration: "Configuración de Diseño",
      columnsPerPage: "Columnas por Página",
      horizontalSpacing: "Espaciado Horizontal (mm)",
      verticalSpacing: "Espaciado Vertical (mm)",
      displayFields: "Campos a Mostrar",
      displayFieldsHelper:
        "Selecciona qué información mostrar en cada etiqueta",
      companyLogoPosition: "Posición del Logo de la Empresa",
      left: "Izquierda",
      center: "Centro",
      right: "Derecha",
      styling: "Estilo",
      qrCodeSize: "Tamaño del Código QR (píxeles)",
      assetTagFontSize: "Tamaño de Fuente de Etiqueta de Activo (px)",
      assetNameFontSize: "Tamaño de Fuente de Nombre de Activo (px)",
      detailsFontSize: "Tamaño de Fuente de Detalles (px)",
      showBorder: "Mostrar Borde",
      labelSize: "Tamaño de Etiqueta",
      small: "Pequeña",
      medium: "Mediana",
      large: "Grande",
      includeCompanyLogo: "Logo de la Empresa",
      includeAssetName: "Nombre del Activo",
      includeAssetTag: "Etiqueta del Activo",
      includeCategory: "Categoría",
      includeLocation: "Ubicación",
      includeBranch: "Sucursal",
      includeDepartment: "Departamento",
      includeAssetType: "Tipo de Activo",
      includePurchaseDate: "Incluir Fecha de Compra",
      preview: "Vista Previa",
      labelPreview: "Vista Previa de Etiqueta",
      showPreview: "Mostrar Vista Previa",
      hidePreview: "Ocultar Vista Previa",
      previewDisclaimer:
        "Esta es una vista previa de cómo se verán tus etiquetas al imprimir. El tamaño real puede variar según la configuración de la impresora.",
      settingsUpdated: "¡Configuración de etiquetas actualizada exitosamente!",
      failedToUpdate: "Error al actualizar la configuración de etiquetas",
      failedToLoad: "Error al cargar la configuración",
      retry: "Reintentar",
      sampleAsset: "Activo de Ejemplo",
      logo: "Logo",
      qrCode: "Código QR",
    },

    // Alerts
    alerts: {
      title: "Configuración de Alertas",
      subtitle:
        "Configura alertas automáticas para hitos de depreciación y umbrales de activos",
      alertRules: "Reglas de Alerta",
      activeAlerts: "Alertas Activas",
      createRule: "Crear Regla de Alerta",
      newAlertRule: "Nueva Regla de Alerta",
      editRule: "Editar Regla de Alerta",
      ruleName: "Nombre de la Regla",
      ruleNamePlaceholder: "ej., Alerta de Alta Depreciación",
      ruleNameRequired: "El nombre es requerido",
      alertType: "Tipo de Alerta",
      selectAlertType: "Selecciona tipo de alerta...",
      depreciationMilestone: "Hito de Depreciación",
      depreciationThreshold: "Umbral de Depreciación",
      bookValueThreshold: "Umbral de Valor en Libros",
      fullyDepreciated: "Completamente Depreciado",
      maintenanceDue: "Mantenimiento Pendiente",
      threshold: "Umbral",
      thresholdPlaceholder: "ej., 80",
      depreciationPercentageThreshold: "Umbral de Porcentaje de Depreciación",
      depreciationPercentageHelper:
        "Alertar cuando el activo alcance este porcentaje de depreciación",
      bookValueThresholdAmount: "Umbral de Valor en Libros",
      bookValueThresholdHelper:
        "Alertar cuando el valor en libros caiga por debajo de este monto",
      fullyDepreciatedHelper:
        "Esta alerta se activa cuando un activo se deprecia completamente (el valor en libros alcanza el valor residual).",
      assetCategory: "Categoría de Activo (Opcional)",
      assetCategoryPlaceholder: "Dejar vacío para todas las categorías",
      assetCategoryHelper:
        "Limitar esta alerta a una categoría de activo específica",
      notifyUsers: "Notificar a usuarios",
      enableAlert: "Habilitar esta alerta",
      ruleCreated: "Regla de alerta creada exitosamente",
      ruleUpdated: "Regla de alerta actualizada exitosamente",
      ruleDeleted: "Regla de alerta eliminada exitosamente",
      deleteConfirm:
        "¿Estás seguro de que quieres eliminar esta configuración de alerta?",
      checkNow: "Verificar Ahora",
      checking: "Verificando...",
      noRulesConfigured: "No hay reglas de alerta configuradas",
      createFirstRule:
        "Crea tu primera regla de alerta para recibir notificaciones sobre eventos importantes de activos",
      noActiveAlerts: "No hay alertas activas",
      allWithinThresholds:
        "Todos los activos están dentro de los umbrales configurados",
      alertTriggered: "nuevas alertas activadas",
      noNewAlerts: "No se activaron nuevas alertas",
      failedToCheck: "Error al verificar alertas",
      acknowledge: "Reconocer",
      alertAcknowledged: "Alerta marcada como reconocida",
      failedToAcknowledge: "Error al marcar alerta",
      allCategories: "Todas las Categorías",
      category: "Categoría",
      type: "Tipo",
      status: "Estado",
      saving: "Guardando...",
      update: "Actualizar",
      create: "Crear",
      markAsRead: "Marcar como Leída",
      viewAsset: "Ver Activo",
    },

    // Roles
    roles: {
      title: "Roles y Permisos",
      subtitle:
        "Configura permisos granulares para diferentes roles de usuario",
      administrator: "Administrador",
      administratorDescription:
        "Acceso completo al sistema con todos los permisos",
      assetManager: "Gestor de Activos",
      assetManagerDescription: "Gestionar activos, ubicaciones y asignaciones",
      employee: "Empleado",
      employeeDescription:
        "Ver activos asignados y actualizar información de custodia",
      auditor: "Auditor",
      auditorDescription:
        "Acceso de solo lectura a toda la información de activos e informes",
      editRole: "Editar Rol",
      permissions: "Permisos",
      moduleAccess: "Acceso a Módulos",
      roleName: "Nombre del Rol",
      roleNamePlaceholder: "ej., Gestor de Activos",
      roleNameRequired: "El nombre del rol es requerido",
      descriptionPlaceholder: "Descripción de este rol...",
      role: "Rol",
      roleCreated: "Rol creado exitosamente",
      roleUpdated: "Rol actualizado exitosamente",
      createFailed: "Error al crear el rol",
      updateFailed: "Error al actualizar el rol",
      noPermissions: "No hay permisos disponibles",
      permissionsSelected: "permisos seleccionados",
      updateRole: "Actualizar Rol",
      createRole: "Crear Rol",
      aboutRoles: "Acerca de Roles y Permisos",
      aboutRolesDescription:
        "Los roles definen qué pueden hacer los usuarios en el sistema. Asigna roles a usuarios en la sección de",
      aboutRolesDescription2: "para asignar roles a usuarios.",
      noRoles: "No hay roles",
      noRolesDescription:
        "Crea tu primer rol para comenzar a gestionar permisos de usuario.",
      createFirstRole: "Crear Primer Rol",
      userCount: "{count, plural, one {# usuario} other {# usuarios}}",
      deleteRole: "Eliminar Rol",
      confirmDelete:
        "¿Estás seguro de que quieres eliminar el rol '{roleName}'? Esta acción no se puede deshacer.",
      cannotDeleteRole:
        "No se puede eliminar este rol porque tiene {count, plural, one {# usuario asignado} other {# usuarios asignados}}.",
      roleDeletedSuccess: "Rol eliminado exitosamente",
      roleDeletedError: "Error al eliminar el rol",
      failedToLoad: "Error al cargar los roles",
    },

    // Users
    users: {
      title: "Gestión de Usuarios",
      subtitle: "Gestiona cuentas de usuario y asignaciones de roles",
      addUser: "Agregar Usuario",
      newUser: "Nuevo Usuario",
      editUser: "Editar Usuario",
      activeUsers: "Usuarios Activos",
      allUsers: "Todos los Usuarios",
      inactiveUsers: "Usuarios Inactivos",
      user: "Usuario",
      email: "Correo Electrónico",
      role: "Rol",
      position: "Posición",
      positionJobTitle: "Posición / Cargo",
      positionPlaceholder: "ej., Gerente de TI",
      identificationNumber: "Número de Identificación",
      identificationPlaceholder: "ej., EMP-001",
      status: "Estado",
      active: "Activo",
      inactive: "Inactivo",
      lastLogin: "Último Acceso",
      userCreated: "Usuario creado exitosamente",
      userUpdated: "Usuario actualizado exitosamente",
      userDeleted: "Usuario eliminado exitosamente",
      userDeactivated: "Usuario desactivado exitosamente",
      userActivated: "Usuario activado exitosamente",
      failedToCreate: "Error al crear usuario",
      failedToUpdate: "Error al actualizar usuario",
      failedToDelete: "Error al desactivar usuario",
      failedToLoad: "Error al cargar usuarios",
      leaveBlankPassword: "Dejar en blanco para mantener la contraseña actual",
      enterPassword: "Ingresar contraseña",
      noRoleAssigned: "Sin rol asignado",
      noBranchAssigned: "Sin sucursal asignada",
      noDepartmentAssigned: "Sin departamento asignado",
      notSpecified: "No especificado",
      selectBranchFirst:
        "Selecciona primero una sucursal para ver los departamentos",
      inactiveUsersNote:
        "Los usuarios inactivos no pueden iniciar sesión en el sistema",
      aboutUserManagement: "Acerca de la Gestión de Usuarios",
      aboutUserManagementText:
        "Los usuarios pueden ser asignados a roles que definen sus permisos en todo el sistema. Los usuarios desactivados no pueden iniciar sesión pero sus datos se conservan para fines de auditoría. Gestiona roles y permisos en la sección de",
      rolesPermissionsLink: "Roles y Permisos",
      section: "sección",
      updateUser: "Actualizar Usuario",
      createUser: "Crear Usuario",
      deactivateConfirm:
        "¿Estás seguro de que quieres desactivar a {name}? Ya no podrán iniciar sesión.",
      noUsers: "No se encontraron usuarios",
      noUsersActive:
        "No hay usuarios activos. Intenta mostrar todos los usuarios.",
      noUsersCompany: "Aún no hay usuarios en tu empresa.",
      addFirstUser: "Agregar Primer Usuario",
      usersCount: "{count} {count, plural, one {usuario} other {usuarios}}",
      loading: "Cargando...",
      actions: "Acciones",
      users: "usuarios",
    },

    // Other Settings Features
    features: {
      alertSettings: {
        title: "Configuración de Alertas",
        description:
          "Configura alertas automáticas para hitos de depreciación, umbrales de valor en libros y más.",
      },
      companySettings: {
        title: "Configuración de la Empresa",
        description:
          "Gestiona la información de tu empresa, marca y preferencias generales.",
      },
      locations: {
        title: "Ubicaciones Físicas",
        description:
          "Gestiona ubicaciones físicas donde se almacenan o usan los activos (almacenes, oficinas, edificios, etc.).",
      },
      branches: {
        title: "Sucursales",
        description:
          "Gestiona sucursales de la empresa con códigos únicos para identificación de activos.",
      },
      departments: {
        title: "Departamentos",
        description:
          "Organiza departamentos por sucursal con códigos únicos para seguimiento de activos.",
      },
      assetTypes: {
        title: "Tipos de Activos",
        description:
          "Define categorías de tipos de activos (Maquinaria, Mobiliario, Vehículos, etc.) con códigos.",
      },
      assetClasses: {
        title: "Clases de Activos",
        description:
          "Define clases de activos vinculadas a tipos de activos con detalles contables y códigos de presupuesto.",
      },
      assetSubclasses: {
        title: "Subclases de Activos",
        description:
          "Gestiona subclases de activos para categorización detallada dentro de cada clase de activo.",
      },
      labelSettings: {
        title: "Configuración de Etiquetas",
        description:
          "Personaliza el diseño, tamaño y la información que se muestra al imprimir etiquetas de código de barras.",
      },
      userManagement: {
        title: "Gestión de Usuarios",
        description:
          "Agrega, edita y gestiona cuentas de usuario con control de acceso basado en roles.",
      },
      rolesPermissions: {
        title: "Roles y Permisos",
        description:
          "Configura permisos granulares para diferentes roles de usuario en todos los módulos.",
      },
      dataManagement: {
        title: "Gestión de Datos",
        description:
          "Importa/exporta datos, gestiona copias de seguridad y configura políticas de retención de datos.",
      },
    },

    configure: "Configurar",
    comingSoon: "Próximamente",
  },

  // Location Types
  locationTypes: {
    WAREHOUSE: "Almacén",
    OFFICE: "Oficina",
    BUILDING: "Edificio",
    ROOM: "Sala",
    FLOOR: "Piso",
    DEPARTMENT: "Departamento",
    STORAGE: "Almacenamiento",
    FACILITY: "Instalación",
    OTHER: "Otro",
  },

  // Languages
  languages: {
    en: "Inglés",
    es: "Español",
    fr: "Francés",
    de: "Alemán",
    it: "Italiano",
    pt: "Portugués",
    zh: "Chino",
    ja: "Japonés",
    ko: "Coreano",
    ar: "Árabe",
  },

  // Currencies
  currencies: {
    USD: "USD - Dólar Estadounidense",
    EUR: "EUR - Euro",
    GBP: "GBP - Libra Esterlina",
    JPY: "JPY - Yen Japonés",
    CAD: "CAD - Dólar Canadiense",
    AUD: "AUD - Dólar Australiano",
    CHF: "CHF - Franco Suizo",
    CNY: "CNY - Yuan Chino",
    INR: "INR - Rupia India",
    MXN: "MXN - Peso Mexicano",
  },

  // Assets
  assets: {
    title: "Activos",
    subtitle: "Gestiona y rastrea tus activos fijos",
    addAsset: "Agregar Activo",
    addFirstAsset: "Agregar Tu Primer Activo",
    noAssetsFound: "No se encontraron activos",
    noAssetsMessage: "Comienza agregando tu primer activo al sistema.",
    filters: "Filtros",
    clearAll: "Limpiar Todo",
    search: "Buscar",
    searchPlaceholder: "Nombre o etiqueta...",
    status: "Estado",
    allStatuses: "Todos los Estados",
    category: "Categoría",
    categoryPlaceholder: "Filtrar por categoría...",
    location: "Ubicación",
    allLocations: "Todas las Ubicaciones",
    branch: "Sucursal",
    allBranches: "Todas las Sucursales",
    department: "Departamento",
    allDepartments: "Todos los Departamentos",
    assetType: "Tipo de Activo",
    allTypes: "Todos los Tipos",
    assignedTo: "Asignado a",
    allUsers: "Todos los Usuarios",
    unassigned: "Sin Asignar",

    // Table headers
    asset: "Activo",
    value: "Valor",
    actions: "Acciones",

    // Status options
    statusActive: "Activo",
    statusInRepair: "En Reparación",
    statusDisposed: "Desechado",
    statusStolen: "Robado",
    statusLost: "Perdido",

    // Asset detail
    backToAssets: "Volver a Activos",
    basicInformation: "Información Básica",
    manufacturer: "Fabricante",
    model: "Modelo",
    serialNumber: "Número de Serie",
    description: "Descripción",

    // Financial section
    financialInformation: "Información Financiera",
    acquisitionCost: "Costo de Adquisición",
    currentValue: "Valor Actual",
    residualValue: "Valor Residual",
    acquisitionDate: "Fecha de Adquisición",
    serviceDate: "Fecha de Servicio",

    // Depreciation section
    depreciation: "Depreciación",
    depreciationMethod: "Método",
    usefulLife: "Vida Útil",
    convention: "Convención",
    depreciationRate: "Tasa de Depreciación",

    // Location & Assignment
    locationAssignment: "Ubicación y Asignación",
    physicalLocation: "Ubicación Física",

    // Supplier section
    supplierPurchase: "Proveedor y Compra",
    supplier: "Proveedor",
    invoiceNumber: "Número de Factura",
    purchaseDocument: "Documento de Compra",
    supplierSerialNumber: "Número de Serie del Proveedor",

    // Observations
    observations: "Observaciones",

    // Photo & Barcode
    photo: "Foto",
    assetBarcode: "Código de Barras del Activo",
    printBarcode: "Imprimir Código de Barras",
    regenerateBarcode: "Regenerar Código de Barras",
    noBarcode: "Aún no se ha generado código de barras",
    generateBarcode: "Generar Código de Barras",
    generating: "Generando...",
    regenerating: "Regenerando...",

    // Quick stats
    quickStats: "Estadísticas Rápidas",
    age: "Antigüedad",
    remainingLife: "Vida Restante",
    years: "años",

    // New asset form
    addNewAsset: "Agregar Nuevo Activo Fijo",
    addNewAssetSubtitle: "Ingresa los detalles completos del nuevo activo",
    assetPhoto: "Foto del Activo",
    clickToSelect: "Haz clic para seleccionar foto",
    uploadPhoto: "Subir Foto",
    uploading: "Subiendo...",
    photoUploaded: "✓ Foto subida exitosamente",
    removePhoto: "Eliminar y subir una foto diferente",

    // Form sections
    assetTag: "Etiqueta / ID del Activo",
    assetTagPlaceholder: "ej., COMP-HQ-001",
    assetTagRequired: "La etiqueta del activo es requerida",
    assetName: "Nombre del Activo",
    assetNamePlaceholder: "ej., Laptop Dell XPS 15",
    assetNameRequired: "El nombre es requerido",
    descriptionPlaceholder: "Descripción detallada del activo...",
    categoryRequired: "La categoría es requerida",
    categoryPlaceholder: "ej., Equipo de Cómputo",

    // Organizational structure
    organizationalStructure: "Estructura Organizacional",
    selectBranch: "Selecciona sucursal...",
    selectDepartment: "Selecciona departamento...",
    selectAssetType: "Selecciona tipo de activo...",
    classCode: "Código de Clase/Tipo",
    classCodePlaceholder: "ej., COMP",
    costCenterCode: "Código de Centro de Costos",
    costCenterCodePlaceholder: "ej., CC-100",
    areaCode: "Código de Área",
    areaCodePlaceholder: "ej., AREA-01",

    // Asset identification
    assetIdentification: "Identificación del Activo",
    serialNumberInternal: "Número de Serie",
    serialNumberPlaceholder: "Número de serie interno",
    seriesNumber: "Número de Series",
    seriesNumberPlaceholder: "Número de series",
    supplierSerialNumberPlaceholder: "Número de serie del proveedor/fabricante",

    // Supplier & Purchase
    supplierPurchaseInfo: "Información de Proveedor y Compra",
    supplierPlaceholder: "Nombre del proveedor",
    invoiceNumberPlaceholder: "ej., FAC-2024-001",
    purchaseDocumentPlaceholder: "ej., OC-2024-001",
    unitCost: "Costo Unitario",
    quantity: "Cantidad",
    quantityPlaceholder: "1",
    currency: "Moneda",
    currencyPlaceholder: "USD",

    // Financial info form
    acquisitionCostPlaceholder: "0.00",
    acquisitionCostRequired: "Debe ser no negativo",
    currentValuePlaceholder: "0.00",
    currentValueRequired: "Debe ser no negativo",
    residualValuePlaceholder: "0.00",

    // Depreciation settings
    depreciationSettings: "Configuración de Depreciación",
    straightLine: "Línea Recta",
    decliningBalance: "Saldo Decreciente",
    unitsOfProduction: "Unidades de Producción",
    sumOfYearsDigits: "Suma de Dígitos de los Años",
    halfYear: "Medio Año",
    fullYear: "Año Completo",
    midMonth: "Medio Mes",
    usefulLifeYears: "Vida Útil (Años)",
    usefulLifePlaceholder: "ej., 5",
    depreciationPercentage: "Porcentaje de Depreciación",
    depreciationPercentagePlaceholder: "ej., 20",
    depreciationStartDate: "Fecha de Inicio de Depreciación",

    // Accounting
    accountingInformation: "Información Contable",
    assetAccountNumber: "Número de Cuenta de Activo",
    assetAccountPlaceholder: "ej., 1500",
    accumulatedDepreciationAccount: "Cuenta de Depreciación Acumulada",
    accumulatedDepreciationPlaceholder: "ej., 1510",
    depreciationExpenseAccount: "Cuenta de Gasto de Depreciación",
    depreciationExpensePlaceholder: "ej., 6300",
    fixedAssetLedger: "Libro Mayor de Activos Fijos/Módulo",
    fixedAssetLedgerPlaceholder: "ej., AF-01",

    // Physical details
    physicalDetailsLocation: "Detalles Físicos y Ubicación",
    manufacturerPlaceholder: "ej., Dell",
    modelPlaceholder: "ej., XPS 15",
    selectLocation: "Selecciona ubicación...",

    // Components
    assetComponents: "Componentes del Activo",
    component1: "Componente 1",
    component1Placeholder: "ej., Monitor",
    component2: "Componente 2",
    component2Placeholder: "ej., Teclado",
    component3: "Componente 3",
    component3Placeholder: "ej., Mouse",

    // Assignment
    assignmentResponsibility: "Asignación y Responsabilidad",
    personResponsible: "Persona Responsable / Usuario",
    custodyCertificateDetails: "Detalles del Certificado de Custodia",
    custodyCertificateMessage:
      "Completa la siguiente información para formalizar la asignación de custodia",
    fixedAssetCode: "Código de Activo Fijo / Número de Placa",
    fixedAssetCodePlaceholder:
      "Por defecto será la Etiqueta del Activo si no se proporciona",
    briefDescription: "Breve Descripción del Activo",
    briefDescriptionPlaceholder: "Breve descripción para fines de custodia...",
    initialCondition: "Condición Inicial",
    initialConditionPlaceholder:
      "Describe la condición del activo al momento de la asignación...",
    maintenanceObligations: "Obligaciones de Mantenimiento",
    maintenanceObligationsPlaceholder:
      "Describe las responsabilidades de mantenimiento y condiciones de uso...",

    // Activity & Project
    activityProject: "Actividad y Proyecto",
    activityProjectLink: "Enlace a Actividad o Proyecto",
    activityProjectPlaceholder:
      "ej., Proyecto XYZ, Iniciativa del Departamento",

    // Additional observations
    additionalObservations: "Observaciones Adicionales",
    observationsPlaceholder:
      "Ingresa cualquier condición especial, información de garantía, restricciones u otras notas importantes...",

    // Actions
    creating: "Creando...",
    createAsset: "Crear Activo",

    // Messages
    assetCreated: "¡Activo creado exitosamente!",
    failedToCreate: "Error al crear el activo",
    failedToLoad: "Error al cargar los activos",
    barcodeGenerated: "¡Código de barras generado exitosamente!",
    failedToGenerateBarcode: "Error al generar el código de barras",
    noBarcodeToPrint: "No hay código de barras disponible para imprimir",

    // Hints and labels
    uniqueIdentifier: "(Identificador único)",
    exampleName: "(ej., Laptop Dell)",
    originalValue: "(Valor original)",
    depreciableValue: "(Valor depreciable)",
    salvageValue: "(Valor de salvamento)",
    datePutIntoService: "(Fecha de puesta en servicio)",
    accountingLabel: "(Contabilidad)",
    legacyField: "(Campo heredado)",
    internalLabel: "(Interno)",
    manufacturerSN: "(N/S del Fabricante)",
    contractPO: "(Contrato/OC #)",
    forIdenticalItems: "(Para artículos idénticos)",
    specialConditions: "(Condiciones especiales, garantías, restricciones)",
  },

  // Finance
  finance: {
    title: "Finanzas y Análisis",
    subtitle:
      "Análisis integral del portafolio de activos y seguimiento de depreciación",

    // Tabs
    assetDistribution: "Distribución de Activos",
    depreciationSchedule: "Calendario de Depreciación",
    valueTrends: "Tendencias de Valor",

    // Time range
    timeRange: "Rango de Tiempo",
    sixMonths: "6 Meses",
    twelveMonths: "12 Meses",
    twentyFourMonths: "24 Meses",
    thirtySixMonths: "36 Meses",

    // Loading states
    loadingFinancialData: "Cargando datos financieros...",
    failedToLoadData: "Error al cargar los datos financieros",
    tryRefreshing: "Por favor intenta actualizar la página.",

    // Asset Distribution Chart
    totalAssets: "Total de Activos",
    totalValue: "Valor Actual",
    totalAcquisitionCost: "Costo de Adquisición",
    totalDepreciation: "Depreciación",
    assetsByCategory: "Activos por Categoría",
    valueByCategory: "Valor por Categoría",
    assetsByStatus: "Activos por Estado",
    topLocationsByValue: "Principales Ubicaciones por Valor",
    categoryBreakdown: "Desglose por Categoría",
    count: "Cantidad",

    // Depreciation Chart
    latestBookValue: "Último Valor en Libros",
    accumulatedDepreciation: "Depreciación Acumulada",
    monthlyDepreciation: "Depreciación Mensual",
    vsPreviousMonth: "vs mes anterior",
    bookValueOverTime: "Valor en Libros a lo Largo del Tiempo",
    depreciationTrends: "Tendencias de Depreciación",
    bookValue: "Valor en Libros",
    period: "Período",
    assets: "Activos",
    accumulated: "Acumulado",
    noDepreciationData:
      "No hay datos de depreciación disponibles. Los cálculos de depreciación aparecerán aquí una vez que los activos sean depreciados.",

    // Value Trends Chart
    currentPortfolioValue: "Valor Actual del Portafolio",
    originalInvestment: "Inversión original",
    ofCost: "del costo",
    activeAssets: "Activos activos",
    portfolioValueTrend: "Tendencia del Valor del Portafolio",
    ofPortfolio: "del portafolio",
    acquisition: "Adquisición",
    depreciated: "Depreciado",
    noTrendData:
      "No hay datos de tendencias disponibles. Las tendencias de valor de activos aparecerán aquí una vez que se realicen los cálculos de depreciación.",
  },

  // Reports
  reports: {
    title: "Informes de Activos",
    subtitle:
      "Genera informes completos con filtrado avanzado y capacidades de exportación",

    // Export buttons
    exportCSV: "Exportar CSV",
    exportPDF: "Exportar PDF",
    exportExcel: "Exportar Excel",
    exporting: "Exportando...",
    generating: "Generando...",

    // Filters
    filters: "Filtros",
    clearAll: "Limpiar Todo",
    search: "Buscar",
    searchPlaceholder: "Nombre o etiqueta...",
    status: "Estado",
    allStatuses: "Todos los Estados",
    branch: "Sucursal",
    allBranches: "Todas las Sucursales",
    department: "Departamento",
    allDepartments: "Todos los Departamentos",
    assetType: "Tipo de Activo",
    allTypes: "Todos los Tipos",
    assetClass: "Clase de Activo",
    allClasses: "Todas las Clases",
    location: "Ubicación",
    allLocations: "Todas las Ubicaciones",
    custodian: "Custodio",
    allCustodians: "Todos los Custodios",
    startDate: "Fecha de Inicio",
    endDate: "Fecha de Fin",

    // Summary stats
    totalAssets: "Total de Activos",
    totalValue: "Valor Total",
    acquisitionCost: "Costo de Adquisición",

    // Table headers
    asset: "Activo",
    typeClass: "Tipo/Clase",
    value: "Valor",
    branchDept: "Sucursal/Depto",
    acquisitionDate: "Fecha de Adquisición",
    cost: "Costo",

    // Empty state
    noAssetsFound: "No se encontraron activos",
    adjustFilters: "Intenta ajustar tus filtros para ver más resultados.",

    // Messages
    reportGenerated: "¡Informe generado exitosamente!",
    assetsExported: "activos exportados.",
    failedToExport: "Error al exportar el informe:",
    pdfGenerated: "¡Informe PDF generado exitosamente!",
    failedToGeneratePDF: "Error al generar el PDF:",
    excelGenerated: "¡Informe Excel generado exitosamente!",
    failedToExportExcel: "Error al exportar Excel:",
    loadingAssets: "Cargando activos...",
    failedToLoad: "Error al cargar los activos",

    // PDF View
    assetReport: "Informe de Activos",
    generated: "Generado:",
    periodLabel: "Período:",
    loadingReport: "Cargando informe...",
    errorLoadingReport: "Error al cargar el informe",
    noAssetsMatching:
      "No se encontraron activos que coincidan con los filtros seleccionados.",
    assetTag: "Etiqueta del Activo",
    name: "Nombre",
    currentValue: "Valor Actual",
    unassigned: "Sin Asignar",
    reportContains: "Este informe contiene",
    assetSingular: "activo",
    assetPlural: "activos",
    withTotalValue: "con un valor actual total de",
    confidential: "Confidencial",
  },

  // Dashboard
  dashboard: {
    title: "Panel de Control",
    welcomeBack:
      "¡Bienvenido de nuevo! Aquí tienes una visión general de tus activos.",
    failedToLoad: "Error al cargar los datos del panel",

    // Admin dashboard
    admin: {
      title: "Panel de Administración",
      welcomeMessage:
        "¡Bienvenido de nuevo! Aquí tienes una visión general de tus activos.",
      totalAssets: "Total de Activos",
      totalValue: "Valor Total",
      activeAssets: "Activos Activos",
      inRepair: "En Reparación",
      quickActions: "Acciones Rápidas",
      addAsset: "Agregar Activo",
      generateReport: "Generar Informe",
      scheduleMaintenance: "Programar Mantenimiento",
      startCounting: "Iniciar Conteo",
      assetsByStatus: "Activos por Estado",
      recentActivity: "Actividad Reciente",
      topCategories: "Principales Categorías",
      depreciationAlerts: "Alertas de Depreciación",
      upcomingMaintenance: "Mantenimiento Próximo",
      noRecentActivity: "No hay actividad reciente",
      noUpcomingMaintenance: "No hay mantenimiento programado",
      acquisitionCost: "Costo de Adquisición",
      totalDepreciation: "Depreciación Total",
    },

    // Employee dashboard
    employee: {
      title: "Mi Panel de Control",
      subtitle: "Ver tus activos asignados y responsabilidades.",
      myAssets: "Mis Activos",
      totalValue: "Valor Total",
      workOrders: "Órdenes de Trabajo",
      recentTransfers: "Transferencias Recientes",
      myAssignedAssets: "Mis Activos Asignados",
      upcomingMaintenance: "Mantenimiento Próximo",
      recentActivity: "Actividad Reciente",
      noAssetsAssigned: "No tienes activos asignados",
      noWorkOrders: "No tienes órdenes de trabajo asignadas",
      noRecentTransfers: "No hay transferencias recientes",
      noUpcomingMaintenance: "No hay mantenimiento próximo",
      noRecentActivity: "No hay actividad reciente",
      viewAll: "Ver Todo",
      from: "De",
      to: "Para",
      due: "Vencimiento",
      assignedToMe: "Asignados a Mí",
      assetCondition: "Condición del Activo",
      maintenanceReminders: "Recordatorios de Mantenimiento",
    },
  },

  // Inventory
  inventory: {
    title: "Gestión de Inventario",
    subtitle:
      "Herramientas completas para inventario físico, escaneo de activos y operaciones masivas",

    // Features
    scanningAssets: "Escaneo de Activos",
    scanningDescription:
      "Usa códigos QR para verificar rápidamente ubicaciones y condiciones de activos durante el inventario físico",
    bulkPrintLabels: "Impresión Masiva de Etiquetas",
    bulkPrintDescription:
      "Genera e imprime etiquetas de código de barras para múltiples activos a la vez",
    transferProcesses: "Procesos de Transferencia",
    transferDescription:
      "Gestiona transferencias de activos entre ubicaciones, sucursales o custodios",
    initialInventory: "Inventario Inicial",
    initialInventoryDescription:
      "Configura tu inventario inicial de activos con capacidades de importación masiva",

    // Scan page
    scanTitle: "Escanear Activos",
    scanSubtitle:
      "Escanea códigos QR de activos para verificar ubicación y condición",
    scanningTips: "Consejos de Escaneo",
    tip1: "Asegura buena iluminación para mejores resultados",
    tip2: "Mantén la cámara estable y enfoca el código QR",
    tip3: "Los códigos deben estar limpios y sin daños",
    assetDetails: "Detalles del Activo",
    verifyLocation: "Verificar Ubicación",
    updateCondition: "Actualizar Condición",
    assetFound: "Activo Encontrado",
    assetNotFound: "Activo no encontrado",
    readyToScan: "Listo para Escanear",
    enterAssetTag:
      "Ingresa una etiqueta de activo o escanea un código QR para comenzar",
    viewFullDetails: "Ver Detalles Completos del Activo",
    scan: "Escanear",

    // Bulk print
    bulkPrintTitle: "Impresión Masiva de Etiquetas",
    bulkPrintSubtitle:
      "Selecciona activos e imprime etiquetas de código de barras",
    selectAssets: "Seleccionar Activos",
    printSelected: "Imprimir Seleccionados",
    selectedCount: "Seleccionados",
    selectAtLeastOne: "Por favor selecciona al menos un activo para imprimir",
    noAssetsSelected: "No hay activos seleccionados",

    // Transfers
    transfersTitle: "Procesos de Transferencia",
    transfersSubtitle: "Gestiona transferencias de activos",
    newTransfer: "Nueva Transferencia",
    transferType: "Tipo de Transferencia",
    allTypes: "Todos los Tipos",
    locationTransfer: "Transferencia de Ubicación",
    custodianTransfer: "Transferencia de Custodio",
    branchTransfer: "Transferencia de Sucursal",
    transferStatus: "Estado",
    allStatuses: "Todos los Estados",
    pending: "Pendiente",
    inProgress: "En Progreso",
    completed: "Completado",
    cancelled: "Cancelado",

    // New transfer
    newTransferTitle: "Nuevo Proceso de Transferencia",
    newTransferSubtitle: "Crear una nueva transferencia de activos",
    createNewTransfer: "Crear Nueva Transferencia",
    initiateTransferMessage:
      "Iniciar un nuevo proceso de transferencia o recepción de activos",
    transferDetails: "Detalles de la Transferencia",
    processType: "Tipo de Proceso",
    transfer: "Transferencia",
    reception: "Recepción",
    defaultLocation: "Ubicación Predeterminada",
    defaultLocationOptional: "Ubicación Predeterminada (Opcional)",
    selectLocation: "Selecciona ubicación...",
    notes: "Notas",
    notesPlaceholder:
      "Agrega cualquier nota sobre este proceso de transferencia...",
    assetsToTransfer: "Activos a Transferir",
    addAssetsMessage: "Agrega activos y especifica su origen y destino",
    addAsset: "Agregar Activo",
    noAssetsAdded: "Aún no se han agregado activos",
    addFirstAsset: "Agregar Primer Activo",
    assetNumber: "Activo #",
    asset: "Activo",
    selectAsset: "Selecciona un activo...",
    fromLocation: "Desde Ubicación",
    toLocation: "Hacia Ubicación",
    fromCustodian: "Desde Custodio",
    toCustodian: "Hacia Custodio",
    notSpecified: "No especificado",
    notesForAsset: "Notas para este activo",
    optionalNotes: "Notas opcionales...",
    creating: "Creando...",
    createTransfer: "Crear Transferencia",
    transferCreated: "¡Proceso de transferencia creado exitosamente!",
    failedToCreate: "Error al crear la transferencia",
    atLeastOneAsset: "Se debe agregar al menos un activo",
    assetRequired: "El activo es requerido",

    // Transfer detail
    backToTransfers: "Volver a Transferencias",
    transferDetail: "Detalles de la Transferencia",
    transferInformation: "Información de la Transferencia",
    totalAssets: "Total de Activos",
    assetSingular: "activo",
    assetPlural: "activos",
    assetMovements: "Movimientos de Activos",
    noAssetsInTransfer: "No hay activos en esta transferencia",
    from: "DESDE",
    to: "HACIA",
    movementDate: "Fecha de movimiento:",
    completeTransfer: "Completar Transferencia",
    cancelTransfer: "Cancelar Transferencia",
    completing: "Completando...",
    confirmComplete:
      "¿Estás seguro de que quieres completar esta transferencia? Esto actualizará todas las ubicaciones y custodios de los activos.",
    confirmCancel:
      "¿Estás seguro de que quieres cancelar esta transferencia? No se realizarán cambios en los activos.",
    transferCompleted: "¡Transferencia completada exitosamente!",
    failedToComplete: "Error al completar la transferencia",
    transferCancelled: "Transferencia cancelada",
    failedToCancel: "Error al cancelar la transferencia",
    loadingTransferDetails: "Cargando detalles de la transferencia...",
    transferNotFound: "Transferencia no encontrada",
    started: "Iniciado:",
    ended: "Finalizado:",
    movementSummary: "Resumen de Movimientos:",

    // Transfers list
    backToInventory: "Volver a Inventario",
    transfersAndReception: "Transferencias y Recepción",
    trackMovements:
      "Rastrea movimientos de activos con registros de auditoría completos",
    loadingTransfers: "Cargando transferencias...",
    noTransfersFound: "No se encontraron transferencias",
    createFirstTransfer:
      "Crea tu primera transferencia para comenzar a rastrear movimientos de activos.",

    // Initial inventory
    initialInventoryTitle: "Inventario Inicial - Importación Masiva",
    bulkImportSubtitle:
      "Importa múltiples activos desde un archivo CSV o Excel para poblar rápidamente tu base de datos de activos",
    importInstructions: "Instrucciones de Importación",
    instruction1: "Descarga la plantilla CSV para ver el formato requerido",
    instruction2:
      "Completa tus datos de activos siguiendo la estructura de la plantilla (formato CSV o Excel)",
    instruction3:
      "Campos requeridos: assetTag, name, category, acquisitionCost, currentValue, acquisitionDate",
    instruction4: "Sube tu archivo CSV o Excel completado",
    instruction5: "Revisa los datos analizados y haz clic en Importar",
    csvTemplate: "Plantilla CSV",
    downloadTemplate:
      "Descarga un archivo de plantilla con todas las columnas requeridas y opcionales (compatible con Excel)",
    downloadTemplateButton: "Descargar Plantilla",
    uploadFile: "Subir Archivo",
    clickToSelectFile: "Haz clic para seleccionar archivo CSV o Excel",
    parseFile: "Analizar Archivo",
    parsing: "Analizando...",
    dataPreview: "Vista Previa de Datos",
    assetsCount: "activos",
    importing: "Importando...",
    importAssets: "Importar Activos",
    importResults: "Resultados de Importación",
    totalProcessed: "Total Procesado",
    successful: "Exitosos",
    failed: "Fallidos",
    errors: "Errores",
    row: "Fila",
    viewAssets: "Ver Activos",
    importMoreAssets: "Importar Más Activos",
    parsedAssets: "Se analizaron {count} activos del archivo",
    failedToParse: "Error al analizar el archivo",
    selectCsvOrExcel: "Por favor selecciona un archivo CSV o Excel",
    showingFirst: "Mostrando los primeros 10 de {count} activos",
    assetTag: "Etiqueta del Activo",
    name: "Nombre",
    category: "Categoría",
    acquisitionCost: "Costo de Adquisición",
    currentValue: "Valor Actual",
    acquisitionDate: "Fecha de Adquisición",
  },

  // Custodians
  custodians: {
    title: "Custodios",
    subtitle: "Gestiona custodios de activos y sus asignaciones",
    searchPlaceholder: "Buscar custodios...",
    name: "Nombre",
    email: "Correo Electrónico",
    assignedAssets: "Activos Asignados",
    totalValue: "Valor Total",
    noCustodiansFound: "No se encontraron custodios",
    editCustodianDetails: "Editar Detalles del Custodio",
    detailsUpdated: "Detalles del custodio actualizados exitosamente",
    failedToUpdate: "Error al actualizar los detalles del custodio",

    // Detail page
    custodianDetails: "Detalles del Custodio",
    printCertificate: "Imprimir Certificado",
    downloadPDF: "Descargar PDF",
    custodianInformation: "Información del Custodio",
    assetsUnderCustody: "Activos Bajo Custodia",
    acknowledgment: "Reconocimiento",
    acknowledgmentText:
      "Reconozco la recepción de los activos listados anteriormente y acepto mantenerlos en buenas condiciones de acuerdo con las políticas de la empresa.",
  },

  // Maintenance
  maintenance: {
    title: "Mantenimiento",
    subtitle:
      "Rastrea y gestiona calendarios e historial de mantenimiento de activos",
    comingSoon: "Próximamente",
    description:
      "Las funciones completas de seguimiento de mantenimiento estarán disponibles pronto, incluyendo:",
    feature1: "Programación de mantenimiento preventivo",
    feature2: "Gestión de órdenes de trabajo",
    feature3: "Seguimiento del historial de mantenimiento",
    feature4: "Gestión de proveedores de servicio",
    feature5: "Seguimiento y análisis de costos",
  },
} as const;
