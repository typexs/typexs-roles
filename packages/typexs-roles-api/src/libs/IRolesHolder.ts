import {IRole} from './IRole';

/**
 * specification for entities (like user or group) which can holder roles
 */
export interface IRolesHolder {

  /**
   * get given roles
   */
  getRoles(): IRole[];

}
