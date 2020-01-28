import {IActivator, IBootstrap} from '@typexs/base';
import {BasicPermission, IPermissionDef, IPermissions, IRolesHolder} from '@typexs/roles-api';

class Perm implements IPermissionDef {

  permission?: string;

  type?: 'single' | 'pattern';

  module?: string;

  desc?: string;

  handle?: (holder: IRolesHolder, ...args: any[]) => (boolean | Promise<boolean>);

  getPermission(): string {
    return this.permission;
  }

  getType(): 'single' | 'pattern' {
    return this.type;
  }

  getModule(): string {
    return this.module;
  }

  getDescription(): string {
    return this.desc;
  }

  getHandle(): (holder: IRolesHolder, ...args: any[]) => (boolean | Promise<boolean>) {
    return this.handle;
  }
}


export class Startup implements IBootstrap, IPermissions {
  bootstrap(): void {
  }

  permissions(): Promise<IPermissionDef[]> | IPermissionDef[] {
    return [
      new BasicPermission('basic2'),
      {
        getPermission(): string {
          return 'with description2';
        },
        getDescription(): string {
          return 'description is here';
        }
      }
    ];
  }
}
