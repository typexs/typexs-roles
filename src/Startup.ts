import {Bootstrap, C_STORAGE_DEFAULT, ClassesLoader, IBootstrap, Inject, StorageRef} from '@typexs/base';
import {PermissionsRegistry} from './libs/PermissionsRegistry';
import {PermissionsRegistryLoader} from './libs/PermissionsRegistryLoader';

export class Startup implements IBootstrap {


  @Inject(PermissionsRegistryLoader.NAME)
  private loader: PermissionsRegistryLoader;

  @Inject(PermissionsRegistry.NAME)
  private registry: PermissionsRegistry;

  @Inject(C_STORAGE_DEFAULT)
  private storageRef: StorageRef;


  async bootstrap() {
    await this.loader.loadInitialBackend();

    const modulActivators = Bootstrap._().getActivators() as any[];
    let permissions = await this.registry.loadFrom(modulActivators);
    await this.loader.save(permissions);

    const modulStartups = Bootstrap._().getModulBootstraps() as any[];
    permissions = await this.registry.loadFrom(modulStartups);
    await this.loader.save(permissions);

    // load roles from configs if not exists, else check


  }


}
