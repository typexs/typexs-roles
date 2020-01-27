import * as _ from 'lodash';
import {C_STORAGE_DEFAULT, Inject, StorageRef} from '@typexs/base';
import {Permission} from '../entities/Permission';
import {PermissionsRegistry} from './PermissionsRegistry';

export class PermissionsRegistryLoader {


  static NAME: string = PermissionsRegistryLoader.name;


  @Inject(PermissionsRegistry.NAME)
  private registry: PermissionsRegistry;


  @Inject(C_STORAGE_DEFAULT)
  private storageRef: StorageRef;

  /**
   * Initial load of permissions
   *
   * Mark all permissions (which are not defined manuel, can be identified by module === 'default')
   * with disabled = true, to identify active once.
   */
  async loadInitialBackend() {
    const permissions = await this.storageRef.getController().find(Permission, {}, {limit: 0}) as Permission[];
    for (const permission of permissions) {
      this.registry.add(permission);
      if (permission.module !== 'default') {
        permission.disabled = true;
      }
    }
  }


  async save(p: Permission[]) {
    if (!_.isEmpty(p)) {
      await this.storageRef.getController().save(p);
    }
    return p;
  }

}
