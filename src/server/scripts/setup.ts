import { minioClient } from "~/server/minio";
import { db } from "~/server/db";
import bcryptjs from "bcryptjs";
import { env } from "~/server/env";

async function setup() {
  // Create MinIO buckets
  const bucketName = "asset-photos";
  const bucketExists = await minioClient.bucketExists(bucketName);
  
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName, "us-east-1");
    console.log(`Created bucket: ${bucketName}`);
    
    // Set bucket policy to allow public read access for files with 'public/' prefix
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/public/*`],
        },
      ],
    };
    
    await minioClient.setBucketPolicy(
      bucketName,
      JSON.stringify(policy)
    );
    console.log(`Set public policy for ${bucketName}/public/*`);
  }
  
  // Define all required permissions
  const requiredPermissions = [
    // Asset permissions
    { name: "assets.view", description: "View assets", category: "assets" },
    { name: "assets.create", description: "Create assets", category: "assets" },
    { name: "assets.edit", description: "Edit assets", category: "assets" },
    { name: "assets.delete", description: "Delete assets", category: "assets" },
    { name: "assets.transfer", description: "Transfer assets", category: "assets" },
    
    // Finance permissions
    { name: "finance.view", description: "View financial data", category: "finance" },
    { name: "finance.depreciation", description: "Calculate depreciation", category: "finance" },
    { name: "finance.reports", description: "Generate financial reports", category: "finance" },
    
    // Maintenance permissions
    { name: "maintenance.view", description: "View maintenance records", category: "maintenance" },
    { name: "maintenance.create", description: "Create maintenance records", category: "maintenance" },
    { name: "maintenance.workorders", description: "Manage work orders", category: "maintenance" },
    
    // Inventory permissions
    { name: "inventory.view", description: "View inventory", category: "inventory" },
    { name: "inventory.count", description: "Perform inventory counts", category: "inventory" },
    { name: "inventory.transfer", description: "Transfer inventory", category: "inventory" },
    
    // Admin permissions
    { name: "admin.users", description: "Manage users", category: "admin" },
    { name: "admin.roles", description: "Manage roles", category: "admin" },
    { name: "admin.company", description: "Manage company settings", category: "admin" },
    { name: "admin.settings", description: "Manage system settings (branches, departments, asset types, alerts)", category: "admin" },
  ];

  // Ensure all required permissions exist (upsert each one)
  for (const permission of requiredPermissions) {
    await db.permission.upsert({
      where: { name: permission.name },
      update: {
        description: permission.description,
        category: permission.category,
      },
      create: permission,
    });
  }
  console.log("Ensured all required permissions exist");

  // Ensure default company exists
  let defaultCompany = await db.company.findFirst({
    where: {
      name: "ExactosCG",
    },
  });

  if (!defaultCompany) {
    defaultCompany = await db.company.create({
      data: {
        name: "ExactosCG",
      },
    });
    console.log("Created default company: ExactosCG");
  }

  // Get all permissions
  const allPermissions = await db.permission.findMany();

  // Create or update Admin role for the company
  let adminRole = await db.role.findFirst({
    where: {
      name: "Admin",
      companyId: defaultCompany.id,
    },
  });

  if (adminRole) {
    // Update existing Admin role to ensure it has all permissions
    // First, delete existing role permissions
    await db.rolePermission.deleteMany({
      where: {
        roleId: adminRole.id,
      },
    });
    
    // Then add all current permissions
    await db.rolePermission.createMany({
      data: allPermissions.map((permission) => ({
        roleId: adminRole.id,
        permissionId: permission.id,
      })),
    });
    console.log("Updated Admin role with all current permissions");
  } else {
    // Create new Admin role with all permissions
    adminRole = await db.role.create({
      data: {
        name: "Admin",
        description: "Full system access",
        companyId: defaultCompany.id,
        permissions: {
          create: allPermissions.map((permission) => ({
            permissionId: permission.id,
          })),
        },
      },
    });
    console.log("Created Admin role for default company");
  }

  // Create or update Employee role for the company
  let employeeRole = await db.role.findFirst({
    where: {
      name: "Employee",
      companyId: defaultCompany.id,
    },
  });

  // Define Employee permissions (read-only access)
  const employeePermissionNames = [
    "assets.view",
    "finance.view",
    "maintenance.view",
    "inventory.view",
  ];

  const employeePermissions = allPermissions.filter((p) =>
    employeePermissionNames.includes(p.name)
  );

  if (employeeRole) {
    // Update existing Employee role to ensure it has the correct permissions
    // First, delete existing role permissions
    await db.rolePermission.deleteMany({
      where: {
        roleId: employeeRole.id,
      },
    });
    
    // Then add the correct permissions
    await db.rolePermission.createMany({
      data: employeePermissions.map((permission) => ({
        roleId: employeeRole.id,
        permissionId: permission.id,
      })),
    });
    console.log("Updated Employee role with read-only permissions");
  } else {
    // Create new Employee role with read-only permissions
    employeeRole = await db.role.create({
      data: {
        name: "Employee",
        description: "Basic read-only access to view assets, finance, maintenance, and inventory",
        companyId: defaultCompany.id,
        permissions: {
          create: employeePermissions.map((permission) => ({
            permissionId: permission.id,
          })),
        },
      },
    });
    console.log("Created Employee role for default company");
  }

  // Create or update Manager role for the company
  let managerRole = await db.role.findFirst({
    where: {
      name: "Manager",
      companyId: defaultCompany.id,
    },
  });

  // Define Manager permissions (operational/edit access, excluding admin and destructive actions)
  const managerPermissionNames = [
    "assets.view",
    "assets.create",
    "assets.edit",
    "assets.transfer",
    "finance.view",
    "maintenance.view",
    "maintenance.create",
    "maintenance.workorders",
    "inventory.view",
    "inventory.count",
    "inventory.transfer",
  ];

  const managerPermissions = allPermissions.filter((p) =>
    managerPermissionNames.includes(p.name)
  );

  if (managerRole) {
    // Update existing Manager role to ensure it has the correct permissions
    // First, delete existing role permissions
    await db.rolePermission.deleteMany({
      where: {
        roleId: managerRole.id,
      },
    });
    
    // Then add the correct permissions
    await db.rolePermission.createMany({
      data: managerPermissions.map((permission) => ({
        roleId: managerRole.id,
        permissionId: permission.id,
      })),
    });
    console.log("Updated Manager role with operational permissions");
  } else {
    // Create new Manager role with operational permissions
    managerRole = await db.role.create({
      data: {
        name: "Manager",
        description: "Operational access to manage assets, maintenance, and inventory with edit permissions",
        companyId: defaultCompany.id,
        permissions: {
          create: managerPermissions.map((permission) => ({
            permissionId: permission.id,
          })),
        },
      },
    });
    console.log("Created Manager role for default company");
  }

  // Seed default admin user if it doesn't exist
  const defaultAdminEmail = "admin@exactoscg.com";
  const existingAdmin = await db.user.findFirst({
    where: {
      email: defaultAdminEmail,
    },
  });

  if (!existingAdmin) {
    // Hash the admin password
    const passwordHash = await bcryptjs.hash(env.ADMIN_PASSWORD, 10);

    // Create default admin user
    await db.user.create({
      data: {
        email: defaultAdminEmail,
        passwordHash,
        firstName: "Admin",
        lastName: "User",
        companyId: defaultCompany.id,
        roleId: adminRole.id,
      },
    });
    console.log(`Created default admin user: ${defaultAdminEmail}`);
  }
}

setup()
  .then(() => {
    console.log("setup.ts complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
