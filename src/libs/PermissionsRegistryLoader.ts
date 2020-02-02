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
      const names = p.map(x => x.permission);
      const save: Permission[] = [];
      const exists = await this.entityController
        .storageRef.getController().find(Permission, {permission: {$in: names}}, {limit: 0}) as Permission[];
      for (const perm of p) {
        const already = !!save.find(x => x.permission === perm.permission);
        if (already) {
          continue;
        }
        const found = exists.find(x => x.permission === perm.permission);
        if (found) {
          perm.id = found.id;
        }
        save.push(perm);
      }

      if (!_.isEmpty(save)) {
        await this.entityController.storageRef.getController().save(save);
      }

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
