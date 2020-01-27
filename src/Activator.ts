import {ClassesLoader, Container, IActivator, Injector} from '@typexs/base';
import {PermissionsRegistry} from './libs/PermissionsRegistry';
import {PermissionsRegistryLoader} from './libs/PermissionsRegistryLoader';

export class Activator implements IActivator {

  startup(): void {
    const r = Injector.create(PermissionsRegistry);
    Container.set(PermissionsRegistry.NAME, r);

    const l = Injector.create(PermissionsRegistryLoader);
    Container.set(PermissionsRegistryLoader.NAME, l);
  }

}
