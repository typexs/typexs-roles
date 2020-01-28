import {expect} from 'chai';
import {Bootstrap, C_STORAGE_DEFAULT, Container, ITypexsOptions, StorageRef} from '@typexs/base';
import {suite, test} from 'mocha-typescript';
import {TestHelper} from './TestHelper';
import {TEST_STORAGE_OPTIONS} from './config';
import {Permission} from '../../src';

let bootstrap: Bootstrap;

// let inc = 0;

@suite(TestHelper.suiteName(__filename))
class StoringSpec {


  async before() {
  }


  async after() {
  }


  @test
  async 'initial permissions storing on activator'() {
    bootstrap = Bootstrap
      .setConfigSources([{type: 'system'}])
      .configure(<ITypexsOptions & any>{
        app: {path: __dirname + '/demo_storing/activator'},
        logging: {enable: true, level: 'debug'},
        modules: {paths: [__dirname + '/../..']},
        storage: {default: TEST_STORAGE_OPTIONS},
        // workers: {access: [{name: 'TaskMonitorWorker', access: 'allow'}]}
      });
    bootstrap.activateLogger();
    bootstrap.activateErrorHandling();
    await bootstrap.prepareRuntime();
    bootstrap = await bootstrap.activateStorage();
    bootstrap = await bootstrap.startup();

    const storageRef = <StorageRef>Container.get(C_STORAGE_DEFAULT);
    const permissions = await storageRef.getController().find(Permission, null, {limit: 0}) as Permission[];

    if (bootstrap) {
      await bootstrap.shutdown();
      Bootstrap.reset();
    }

    expect(permissions).to.have.length.gt(0);
    const allPermission = permissions.find(x => x.permission === '*');

    expect(allPermission.permission).to.be.eq('*');
    expect(allPermission.module).to.be.eq('@typexs/roles');

    const appPermission = permissions.filter(x => x.getModule() === 'app_storing_activator');
    expect(appPermission).to.have.length(2);
    expect(appPermission.map(x => x.permission)).to.be.deep.eq(['basic', 'with description']);

  }


  @test
  async 'initial permissions storing on startup'() {
    bootstrap = Bootstrap
      .setConfigSources([{type: 'system'}])
      .configure(<ITypexsOptions & any>{
        app: {path: __dirname + '/demo_storing/startup'},
        logging: {enable: true, level: 'debug'},
        modules: {paths: [__dirname + '/../..']},
        storage: {default: TEST_STORAGE_OPTIONS},
        // workers: {access: [{name: 'TaskMonitorWorker', access: 'allow'}]}
      });
    bootstrap.activateLogger();
    bootstrap.activateErrorHandling();
    await bootstrap.prepareRuntime();
    bootstrap = await bootstrap.activateStorage();
    bootstrap = await bootstrap.startup();

    const storageRef = <StorageRef>Container.get(C_STORAGE_DEFAULT);
    const permissions = await storageRef.getController().find(Permission, null, {limit: 0}) as Permission[];

    if (bootstrap) {
      await bootstrap.shutdown();
      Bootstrap.reset();
    }
    expect(permissions).to.have.length.gt(0);
    const allPermission = permissions.find(x => x.permission === '*');

    expect(allPermission.permission).to.be.eq('*');
    expect(allPermission.module).to.be.eq('@typexs/roles');

    const appPermission = permissions.filter(x => x.getModule() === 'app_storing_startup');
    expect(appPermission).to.have.length(2);
    expect(appPermission.map(x => x.permission)).to.be.deep.eq(['basic2', 'with description2']);
  }
}
