import * as _ from 'lodash';
import {Cache, CryptUtils, Inject} from '@typexs/base';
import {PermissionsRegistry} from './PermissionsRegistry';

import {IPermissionDef, IRole, IRolesHolder, ISecuredResource} from '@typexs/roles-api';
import {MatchUtils} from '@typexs/base/libs/utils/MatchUtils';

/**
 * Access
 */
export class Access {

  cacheBin: string = 'access';

  @Inject(PermissionsRegistry.NAME)
  registry: PermissionsRegistry;

  @Inject(Cache.NAME)
  cache: Cache;

  static getPermissionFromResource(obj: ISecuredResource) {
    const permissionNames = _.concat([], ...obj.getPermissions().map(p => p.permission));
    return permissionNames;
  }


  static getPermissionFromRoles(roles: IRole[]) {
    const permissionNames = _.concat([], ...roles.map(x => _.concat([], ...x.permissions.map(p => _.isString(p) ? p : p.permission))));
    return permissionNames;
  }

  static checkPermission(permissions: IPermissionDef[], permissionValue: string) {
    let allowed = false;
    for (const permission of permissions) {
      let matched = false;
      switch (permission.type || 'single') {
        case 'pattern':
          matched = !!MatchUtils.miniMatch(permission.permission, permissionValue);
          break;
        default:
          matched = (permission.permission === permissionValue);
      }
      if (matched) {
        allowed = matched;
        break;
      }
    }
    return allowed;
  }


  // validate(credential: IRolesHolder, permissionValue: string);
  async validate(credential: IRolesHolder, permissionValue: string | string[] | ISecuredResource) {
    if (_.isEmpty(permissionValue)) {
      return false;
    }
    // get permission
    const key = [
      'access',
      credential.getIdentifier(),
    ];

    let resource: ISecuredResource = null;
    let permissionValues: string[] = [];
    if (permissionValue['getIdentifier'] && permissionValue['getPermissions']) {
      resource = <ISecuredResource>permissionValue;
      permissionValues = Access.getPermissionFromResource(resource);
      key.push(resource.getIdentifier());
    } else if (_.isString(permissionValue)) {
      permissionValues = [permissionValue];
    } else if (_.isArray(permissionValue) && _.isString(permissionValue[0])) {
      permissionValues = permissionValue;
    }

    permissionValues = _.uniq(permissionValues).sort();
    key.push(CryptUtils.shorthash(permissionValues.join('-')));
    const cacheKey = key.join('-');

    const res = await this.cache.get(cacheKey, this.cacheBin);
    if (!_.isNull(res)) {
      return res;
    }


    let allowed = false;
    const permissionDefs: IPermissionDef[] = this.getPermissions(permissionValues);
    if (!_.isEmpty(permissionDefs)) {
      const roles: IRole[] = await credential.getRoles();
      if (!_.isEmpty(roles)) {
        const permissions = this.getPermissions(Access.getPermissionFromRoles(roles));
        if (!_.isEmpty(permissions)) {
          allowed = await this.checkPermissions(permissions, permissionValues, credential, resource);
        }
      }
    }

    await this.cache.set(cacheKey, allowed, this.cacheBin, {ttl: 3600});
    return allowed;
  }


  getPermissions(names: string[]) {
    const permissions = names.map(x => this.registry.find(x)).filter(x => !_.isEmpty(x));
    return permissions;
  }


  async checkPermissions(permissions: IPermissionDef[], permissionValues: string[], holder?: IRolesHolder, resource?: ISecuredResource) {
    const arrAllowed: boolean[] = permissionValues.map(x => false);
    let allowed = false;
    for (const permission of permissions) {
      for (let i = 0; i < permissionValues.length; i++) {
        if (arrAllowed[i]) {
          continue;
        }
        const permissionValue = permissionValues[i];

        let _allowed = false;
        switch (permission.type || 'single') {
          case 'pattern':
            _allowed = !!MatchUtils.miniMatch(permission.permission, permissionValue);
            break;
          default:
            _allowed = permissionValue === permission.permission;
        }

        if (_allowed) {
          const handle = permission.handle;
          if (handle) {
            arrAllowed[i] = await handle(holder, resource, this);
          } else {
            arrAllowed[i] = true;
          }
        } else {
          arrAllowed[i] = false;
        }
      }

      allowed = arrAllowed.reduce((previousValue, currentValue) => previousValue && currentValue);
      if (allowed) {
        break;
      }
    }
    return allowed;
  }


}
