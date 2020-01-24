import {IPermissionDef} from './IPermissionDef';

export class BasicPermission implements IPermissionDef {

  permission: string;

  type: 'single' | 'pattern' = 'single';

  constructor(permission: string, type: 'single' | 'pattern' = 'single') {
    this.permission = permission;
    this.type = type;
  }

  getPermission(): string {
    return this.permission;
  }

  getType(): 'single' | 'pattern' {
    return this.type;
  }

}
