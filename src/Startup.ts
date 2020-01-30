import * as _ from 'lodash';
import {Bootstrap, ClassesLoader, Config, IBootstrap, Inject} from '@typexs/base';
import {PermissionsRegistry} from './libs/PermissionsRegistry';
import {PermissionsRegistryLoader} from './libs/PermissionsRegistryLoader';
import {BasicPermission, IPermissionDef, IRole} from '@typexs/roles-api';
import {Role} from './entities/Role';
import {Permission} from './entities/Permission';

export class Startup implements IBootstrap {


  @Inject(PermissionsRegistryLoader.NAME)
  private loader: PermissionsRegistryLoader;

  @Inject(PermissionsRegistry.NAME)
  private registry: PermissionsRegistry;


  async bootstrap() {
    await this.loader.loadInitialBackend();

    const modulActivators = Bootstrap._().getActivators() as any[];
    let permissions = await this.registry.loadFrom(modulActivators);
    await this.loader.savePermissions(permissions);

    const modulStartups = Bootstrap._().getModulBootstraps() as any[];
    permissions = await this.registry.loadFrom(modulStartups);
    await this.loader.savePermissions(permissions);

    const localPermissionDefs: IPermissionDef[] = [];
    const cfgPermissions = Config.get('initialise.permissions', []);
    if (_.isArray(cfgPermissions)) {
      for (const _p of cfgPermissions) {
        if (_.isString(_p)) {
          localPermissionDefs.push(new BasicPermission(_p));
        } else {
          if (_p.permission) {
            const p = new BasicPermission(_p.permission);
            localPermissionDefs.push(p);
            _.assign(p, _p);
          }
        }
      }

      if (!_.isEmpty(localPermissionDefs)) {
        permissions = await this.registry.loadDefs(localPermissionDefs);
        await this.loader.savePermissions(permissions);
      }
    }

    const cfgRoles = Config.get('initialise.roles', []) as IRole[];
    const localRoles: Role[] = [];

    // collect permissions
    for (const cfgRole of cfgRoles) {


      const rolePermissions = _.get(cfgRole, 'permissions', []);
      let rolePermissionToSave: Permission[] = [];
      if (!_.isEmpty(rolePermissions)) {
        const rolePermissionSave: IPermissionDef[] = [];
        for (const rolePermission of rolePermissions) {
          if (_.isString(rolePermission)) {
            rolePermissionSave.push(new BasicPermission(rolePermission));
          } else {
            rolePermissionSave.push(rolePermission);
          }
        }

        if (!_.isEmpty(rolePermissionSave)) {
          rolePermissionToSave = await this.registry.loadDefs(rolePermissionSave);
          await this.loader.savePermissions(rolePermissionToSave);
        }
      }


      let role = await this.loader.findRole(cfgRole.role) as Role;

      if (!role) {
        role = new Role();
        role.role = cfgRole.role;
      }

      role.label = cfgRole.label ? cfgRole.label : null;
      role.description = cfgRole.description ? cfgRole.description : null;
      role.displayName = cfgRole.label ? cfgRole.label : null;
      role.disabled = false;
      role.permissions = rolePermissionToSave;
      localRoles.push(role);

    }

    if (!_.isEmpty(localRoles)) {
      await this.loader.saveRoles(localRoles);
    }


  }


}
