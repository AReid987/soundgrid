import { PersonaType } from "@prisma/client"

// Permission definitions
export const Permissions = {
  // Contract permissions
  CONTRACT_CREATE: "contract:create",
  CONTRACT_READ: "contract:read",
  CONTRACT_SIGN: "contract:sign",
  CONTRACT_CANCEL: "contract:cancel",
  
  // Catalog permissions
  CATALOG_CREATE: "catalog:create",
  CATALOG_READ: "catalog:read",
  CATALOG_UPDATE: "catalog:update",
  CATALOG_DELETE: "catalog:delete",
  
  // Payment permissions
  PAYMENT_SEND: "payment:send",
  PAYMENT_RECEIVE: "payment:receive",
  PAYMENT_VIEW_ESCROW: "payment:view_escrow",
  
  // Sync/Marketplace permissions
  SYNC_BROWSE: "sync:browse",
  SYNC_SUBMIT: "sync:submit",
  SYNC_POST_BRIEF: "sync:post_brief",
  
  // Live/Booking permissions
  LIVE_BROWSE_VENUES: "live:browse_venues",
  LIVE_BOOK: "live:book",
  LIVE_MANAGE_BOOKINGS: "live:manage_bookings",
  
  // Organization permissions
  ORG_MANAGE: "org:manage",
  ORG_INVITE: "org:invite",
} as const

export type Permission = typeof Permissions[keyof typeof Permissions]

// Permission matrix by persona type
export const PersonaPermissions: Record<PersonaType, Permission[]> = {
  ARTIST: [
    Permissions.CONTRACT_CREATE,
    Permissions.CONTRACT_READ,
    Permissions.CONTRACT_SIGN,
    Permissions.CONTRACT_CANCEL,
    Permissions.CATALOG_CREATE,
    Permissions.CATALOG_READ,
    Permissions.CATALOG_UPDATE,
    Permissions.CATALOG_DELETE,
    Permissions.PAYMENT_RECEIVE,
    Permissions.PAYMENT_VIEW_ESCROW,
    Permissions.SYNC_BROWSE,
    Permissions.SYNC_SUBMIT,
    Permissions.LIVE_BROWSE_VENUES,
    Permissions.LIVE_BOOK,
  ],
  
  PRODUCER: [
    Permissions.CONTRACT_CREATE,
    Permissions.CONTRACT_READ,
    Permissions.CONTRACT_SIGN,
    Permissions.CONTRACT_CANCEL,
    Permissions.CATALOG_CREATE,
    Permissions.CATALOG_READ,
    Permissions.CATALOG_UPDATE,
    Permissions.CATALOG_DELETE,
    Permissions.PAYMENT_RECEIVE,
    Permissions.PAYMENT_VIEW_ESCROW,
    Permissions.SYNC_BROWSE,
    Permissions.SYNC_SUBMIT,
    Permissions.LIVE_BROWSE_VENUES,
  ],
  
  SUPERVISOR: [
    Permissions.CONTRACT_READ,
    Permissions.CONTRACT_SIGN,
    Permissions.PAYMENT_SEND,
    Permissions.PAYMENT_VIEW_ESCROW,
    Permissions.SYNC_BROWSE,
    Permissions.SYNC_POST_BRIEF,
    Permissions.CATALOG_READ,
  ],
  
  VENUE: [
    Permissions.CONTRACT_CREATE,
    Permissions.CONTRACT_READ,
    Permissions.CONTRACT_SIGN,
    Permissions.CONTRACT_CANCEL,
    Permissions.PAYMENT_RECEIVE,
    Permissions.PAYMENT_VIEW_ESCROW,
    Permissions.LIVE_MANAGE_BOOKINGS,
  ],
  
  MANAGER: [
    Permissions.CONTRACT_CREATE,
    Permissions.CONTRACT_READ,
    Permissions.CONTRACT_SIGN,
    Permissions.CONTRACT_CANCEL,
    Permissions.CATALOG_READ,
    Permissions.CATALOG_UPDATE,
    Permissions.PAYMENT_RECEIVE,
    Permissions.PAYMENT_VIEW_ESCROW,
    Permissions.SYNC_BROWSE,
    Permissions.SYNC_SUBMIT,
    Permissions.ORG_MANAGE,
    Permissions.ORG_INVITE,
  ],
}

// Check if a persona type has a specific permission
export function hasPermission(
  personaType: PersonaType,
  permission: Permission
): boolean {
  return PersonaPermissions[personaType].includes(permission)
}

// Get all permissions for a persona type
export function getPermissions(personaType: PersonaType): Permission[] {
  return PersonaPermissions[personaType]
}

// Check multiple permissions (all must be granted)
export function hasAllPermissions(
  personaType: PersonaType,
  permissions: Permission[]
): boolean {
  const granted = PersonaPermissions[personaType]
  return permissions.every(p => granted.includes(p))
}

// Check multiple permissions (at least one must be granted)
export function hasAnyPermission(
  personaType: PersonaType,
  permissions: Permission[]
): boolean {
  const granted = PersonaPermissions[personaType]
  return permissions.some(p => granted.includes(p))
}

// Permission groups for common checks
export const PermissionGroups = {
  CONTRACT_FULL: [
    Permissions.CONTRACT_CREATE,
    Permissions.CONTRACT_READ,
    Permissions.CONTRACT_SIGN,
    Permissions.CONTRACT_CANCEL,
  ],
  CATALOG_FULL: [
    Permissions.CATALOG_CREATE,
    Permissions.CATALOG_READ,
    Permissions.CATALOG_UPDATE,
    Permissions.CATALOG_DELETE,
  ],
  PAYMENT_RECEIVE: [
    Permissions.PAYMENT_RECEIVE,
    Permissions.PAYMENT_VIEW_ESCROW,
  ],
  SYNC_MARKETPLACE: [
    Permissions.SYNC_BROWSE,
    Permissions.SYNC_SUBMIT,
  ],
  LIVE_BOOKING: [
    Permissions.LIVE_BROWSE_VENUES,
    Permissions.LIVE_BOOK,
  ],
}

// Feature access checks
export const FeatureAccess = {
  canCreateContracts: (type: PersonaType) => 
    hasPermission(type, Permissions.CONTRACT_CREATE),
  
  canReceivePayments: (type: PersonaType) =>
    hasPermission(type, Permissions.PAYMENT_RECEIVE),
  
  canManageCatalog: (type: PersonaType) =>
    hasAllPermissions(type, PermissionGroups.CATALOG_FULL),
  
  canAccessSyncMarketplace: (type: PersonaType) =>
    hasPermission(type, Permissions.SYNC_BROWSE),
  
  canPostSyncBriefs: (type: PersonaType) =>
    hasPermission(type, Permissions.SYNC_POST_BRIEF),
  
  canBookVenues: (type: PersonaType) =>
    hasAllPermissions(type, PermissionGroups.LIVE_BOOKING),
  
  canManageVenueBookings: (type: PersonaType) =>
    hasPermission(type, Permissions.LIVE_MANAGE_BOOKINGS),
}
