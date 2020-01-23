export interface IPermissionDef {

  /**
   * Name
   */
  permission: string;

  /**
   * Description
   */
  description?: string;

  /**
   * Description
   */
  module?: string;

  /**
   * own check
   */
  handle?: any;

  /**
   * own check
   */
  type?: 'single' | 'pattern';


}
