import {IPermissionDef} from './IPermissionDef';
import {IRolesHolder} from './IRolesHolder';
import {ISecuredResource} from './ISecuredResource';
import {IRole} from './IRole';


export class PermissionHelper {

  static MATCHER: any;

  static miniMatch(pattern: string, string: string) {
    try {
      if (!this.MATCHER) {
        this.MATCHER = require('@cezaryrk/minimatch');
      }
      return new this.MATCHER.Minimatch(pattern).match(string);
    } catch (e) {
      throw e;
    }
  }

  static async checkPermissions(
    permissions: IPermissionDef[], permissionValues: string[], holder?: IRolesHolder, resource?: ISecuredResource
  ) {
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
            _allowed = !!this.miniMatch(permission.permission, permissionValue);
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

  static getPermissionFromResource(obj: ISecuredResource) {
    const permissionNames = [].concat([], ...obj.getPermissions().map(p => p.permission));
    return permissionNames;
  }


  static getPermissionFromRoles(roles: IRole[]) {
    const permissionNames = [].concat([],
      ...roles.map(x => [].concat([], ...x.permissions.map(p => typeof p === 'string' ? p : p.permission))));
    return permissionNames;
  }

  static checkPermission(permissions: IPermissionDef[], permissionValue: string) {
    let allowed = false;
    for (const permission of permissions) {
      let matched = false;
      switch (permission.type || 'single') {
        case 'pattern':
          matched = !!this.miniMatch(permission.permission, permissionValue);
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


}
