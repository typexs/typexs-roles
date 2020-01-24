import {IRolesHolder} from './IRolesHolder';

/**
 * permission specification
 */
export interface IPermissionDef {

  /**
   * Name
   */
  getPermission(): string;

  /**
   * Description
   */
  getDescription?(): string;

  /**
   * Description
   */
  getModule?(): string;

  /**
   * own check
   */
  getHandle?(): (holder: IRolesHolder, ...args: any[]) => boolean | Promise<boolean>;


  /**
   * own check
   */
  getType?(): 'single' | 'pattern';


}
