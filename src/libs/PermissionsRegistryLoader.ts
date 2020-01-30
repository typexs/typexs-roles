import * as _ from 'lodash';
import {Inject} from '@typexs/base';
import {Permission} from '../entities/Permission';
import {PermissionsRegistry} from './PermissionsRegistry';
import {EntityController} from '@typexs/schema';
import {Role} from '../entities/Role';

export class PermissionsRegistryLoader {


  static NAME: string = PermissionsRegistryLoader.name;


  @Inject(PermissionsRegistry.NAME)
  private registry: PermissionsRegistry;


  @Inject('EntityController.default')
  private entityController: EntityController;


  /**
   * Initial load of permissions
   *
   * Mark all permissions (which are not defined manuel, can be identified by module === 'default')
   * with disabled = true, to identify active once.
   */
  async loadInitialBackend() {
    const permissions = await this.entityController.storageRef.getController().find(Permission, {}, {limit: 0}) as Permission[];
    for (let permission of permissions) {
      permission = this.registry.add(permission);
      if (permission.module !== 'default') {
        permission.disabled = true;
      }
    }
  }


  async savePermissions(p: Permission[]) {
    if (!_.isEmpty(p)) {
      await this.entityController.storageRef.getController().save(p);
    }
    return p;
  }


  async findRole(name: string) {
    return this.entityController.findOne(Role, {rolename: name}, {limit: 1});
  }

  async saveRoles(p: Role[]) {
    if (!_.isEmpty(p)) {
      await this.entityController.save(p);
    }
    return p;
  }
}
