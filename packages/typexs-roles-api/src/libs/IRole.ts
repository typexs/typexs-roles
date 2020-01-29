import {IPermissionDef} from './IPermissionDef';

/**
 * role specification
 */
export interface IRole {

  /**
   * return the litaral name of the role
   */
  role: string;

  /**
   * return the litaral name of the role
   */
  displayName: string;

  /**
   * return the with this role associated permissions
   */
  permissions?: (string | IPermissionDef)[];

}
