import * as _ from 'lodash';
import {IPermissions} from '@typexs/roles-api';
import {C_STORAGE_DEFAULT, ClassesLoader, Inject, StorageRef} from '@typexs/base';
import {Permission} from '../entities/Permission';


/**
 * TODO
 */
export class PermissionsRegistry {

  static NAME: string = PermissionsRegistry.name;

  @Inject(C_STORAGE_DEFAULT)
  private storageRef: StorageRef;

  // TODO dynamic permissions loader
  permissions: Permission[];


  /**
   * Initial load of permissions
   *
   * Mark all permissions (which are not defined manuel, can be identified by module === 'default')
   * with disabled = true, to identify active once.
   */
  async prepare() {
    this.permissions = await this.storageRef.getController().find(Permission, {}, {limit: 0});
    for (const permission of this.permissions) {
      if (permission.module !== 'default') {
        permission.disabled = true;
      }
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

        const _module = ClassesLoader.getModulName((<any>ipermissions).__proto__.constructor);
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

    if (permissions.length > 0) {
      await this.storageRef.getController().save(permissions);
    }
    return permissions;
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
