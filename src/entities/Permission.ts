import {Asc, Entity, From, Join, Property, To} from '@typexs/schema/browser';
import {And, Eq, Key, Value} from 'commons-expressions/browser';
import {RBelongsTo} from './RBelongsTo';
import {Role} from './Role';
import {IPermissionDef} from '@typexs/roles-api';


@Entity()
export class Permission implements IPermissionDef {

  @Property({type: 'number', auto: true})
  id: number;

  @Property({type: 'string', typeorm: {unique: true}})
  permission: string;

  @Property({type: 'string', nullable: true})
  description: string;

  @Property({type: 'string', typeorm: {index: true, nullable: true}})
  module: string | 'default';

  // Is single permission or permission pattern ...
  @Property({type: 'string', typeorm: {index: true}})
  type: 'single' | 'pattern';

  @Property({type: 'boolean'})
  disabled = false;

  @Property({
    type: 'Role', cardinality: 0,
    join: Join(RBelongsTo, [
        From(Eq('refid', Key('id'))),
        To(Eq('id', Key('ownerid')))
      ],
      And(
        Eq('ownertab', Value('role')),
        Eq('reftab', Value('permission'))),
      [Asc(Key('sort')), Asc(Key('id'))])
  })
  roles: Role[];

  // @FormReadonly()
  @Property({type: 'date:created'})
  created_at: Date;

  // @FormReadonly()
  @Property({type: 'date:updated'})
  updated_at: Date;

  handle?: (cred: any, obj: any) => boolean;

  hasOwnHandle() {
    return !!this.handle;
  }

  label() {
    return this.permission;
  }
}
