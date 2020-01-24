import {ClassesLoader, Container, IActivator, Injector} from '@typexs/base';
import {PermissionsRegistry} from './libs/PermissionsRegistry';

export class Activator implements IActivator {

  startup(): void {
    const r = Injector.create(PermissionsRegistry);
    Container.set(PermissionsRegistry.NAME, r);
  }

}
