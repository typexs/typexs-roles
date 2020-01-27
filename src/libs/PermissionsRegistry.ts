import * as _ from 'lodash';
import {IPermissions} from '@typexs/roles-api';
import {Permission} from '../entities/Permission';


const MODULE_NAME = '__MODULNAME__';


/**
 * TODO
 */
export class PermissionsRegistry {

  static NAME: string = PermissionsRegistry.name;

  // TODO dynamic permissions loader
  permissions: Permission[] = [];


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
            _.assign(permission, p);
          }

          permission.module = _module || 'default';
          permission.type = /\*/.test(permission.permission) ? 'pattern' : 'single';
          permission.disabled = false;
        }
      }
    }

    return permissions;
  }

  async add(p: Permission) {
    this.permissions.push(p);
    return p;
  }

  find(permission: string): Permission;
  find(permission: string[]): Permission[];
  find(permission: string | string[]): Permission | Permission[] {
    if (_.isString(permission)) {
      return this.permissions.find(x => x.permission === permission);
    }
    return this.permissions.filter(x => permission.includes(x.permission));
  }


}
