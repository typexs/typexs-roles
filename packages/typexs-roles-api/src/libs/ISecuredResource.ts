/**
 * Defines a secured resource
 */
export interface ISecuredResource {

  /**
   * return a unique identifier for the resource
   */
  getIdentifier(): string | number;

}
