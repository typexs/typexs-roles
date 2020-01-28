import * as _ from 'lodash';
import {IPermissions} from '@typexs/roles-api';
import {Permission} from '../entities/Permission';


const MODULE_NAME = '__MODULNAME__';


/**
 * Registry for permissions holding
 */
export class PermissionsRegistry {

  static NAME: string = PermissionsRegistry.name;

  // TODO dynamic permissions loader
  permissions: Permission[] = [];

  /**
   * Method to get the modul name of the class
   *
   * @param cls
   */
  static getModulName(cls: Function) {
    if (Reflect && Reflect['getOwnMetadata']) {
      return Reflect['getOwnMetadata'](MODULE_NAME, cls);
    } else {
      return cls[MODULE_NAME] ? cls[MODULE_NAME] : null;
    }
  }


  /**
   * Load permissions from classes implementing IPermissions
   *
   * @param impls
   */
  async loadFrom(impls: IPermissions[]) {
    // collect permissions
    const permissions = [];
    for (const activator of impls) {
      const ipermissions: IPermissions = (<IPermissions>(<any>activator));
      if (ipermissions.permissions) {
        // if methods

        const _module = PermissionsRegistry.getModulName((<any>ipermissions).__proto__.constructor);
        const modul_permissions = await ipermissions.permissions();

        for (const p of modul_permissions) {
          let permissionName: string = null;
          let permission = new Permission();
          if (_.isString(p)) {
            // deprecated only permission name
            permissionName = p;
          } else {
            permissionName = p.getPermission();
          }

          const exists = this.permissions.find(x => x.permission === permissionName);
          if (exists) {
            permission = exists;
          } else {
            this.permissions.push(permission);
            permissions.push(permission);
          }

          if (_.isString(p)) {
            // deprecated only permission name
            permission.permission = permissionName;
          } else {
            permission.description = p.getDescription ? p.getDescription() : null;
            permission.permission = permissionName;
            permission.module = p.getModule ? p.getModule() : null;
            permission.type = p.getType ? p.getType : <any>null;
            permission.handle = permission.getHandle ? permission.getHandle() : null;
          }


          permission.module = permission.module || _module || 'default';
          permission.type = permission.type || /\*/.test(permission.permission) ? 'pattern' : 'single';
          permission.disabled = false;
        }
      }
    }

    return permissions;
  }

  /**
   * Add new permission
   *
   * @param p
   */
  add(p: Permission) {
    this.permissions.push(p);
    return p;
  }

  /**
   * Find permissions by name
   *
   * @param permission
   */
  find(permission: string): Permission;
  find(permission: string[]): Permission[];
  find(permission: string | string[]): Permission | Permission[] {
    if (_.isString(permission)) {
      return this.permissions.find(x => x.permission === permission);
    }
    return this.permissions.filter(x => permission.includes(x.permission));
  }


}
