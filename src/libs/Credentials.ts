import {Inject} from '@typexs/base';
import {PermissionsRegistry} from './PermissionsRegistry';

export class Credentials {

  @Inject(PermissionsRegistry.NAME)
  registry: PermissionsRegistry;

  access(permission: string, credential: any, object: any) {
    // get permission
    const permissionDef = this.registry.find(permission);
    if (permissionDef) {
      if (permissionDef.hasOwnHandle()) {
        // has onw handle function
        return permissionDef.handle(credential, object);
      } else {

      }
    } else {
      // if no permission found, then forbid access
      return false;
    }
  }

}
