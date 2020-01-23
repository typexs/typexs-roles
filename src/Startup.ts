import {Bootstrap, ClassesLoader, IBootstrap, Inject} from '@typexs/base';
import {PermissionsRegistry} from './libs/PermissionsRegistry';

export class Startup implements IBootstrap {


  @Inject(PermissionsRegistry.NAME)
  private registry: PermissionsRegistry;

  // @Inject(RuntimeLoader.NAME)
  // loader: RuntimeLoader;


  async bootstrap() {
    await this.registry.prepare();

    const modulActivators = Bootstrap._().getActivators() as any[];
    await this.registry.loadFrom(modulActivators);

    const modulStartups = Bootstrap._().getModulBootstraps() as any[];
    await this.registry.loadFrom(modulStartups);

  }


}
