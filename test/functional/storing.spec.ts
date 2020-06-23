import * as _ from 'lodash';
import {expect} from 'chai';
import {Bootstrap, C_STORAGE_DEFAULT, Config, Container, ITypexsOptions, StorageRef} from '@typexs/base';
import {suite, test} from 'mocha-typescript';
import {TEST_STORAGE_OPTIONS} from './config';
import {Permission} from '../../src';
import {Role} from '../../src/entities/Role';
import {EntityController} from '@typexs/schema/libs/EntityController';

let bootstrap: Bootstrap;

// let inc = 0;

// @suite(TestHelper.suiteName(__filename))
@suite('functional/storing')
class StoringSpec {


  async before() {
  }


  async after() {
    if (bootstrap) {
      await bootstrap.shutdown();
      Bootstrap.reset();
    }
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


    expect(permissions).to.have.length.gt(0);
    const allPermission = permissions.find(x => x.permission === '*');

    expect(allPermission.permission).to.be.eq('*');
    expect(allPermission.module).to.be.eq('@typexs/roles');

    const appPermission = permissions.filter(x => x.module === 'app_storing_activator');
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

    expect(permissions).to.have.length.gt(0);
    const allPermission = permissions.find(x => x.permission === '*');

    expect(allPermission.permission).to.be.eq('*');
    expect(allPermission.module).to.be.eq('@typexs/roles');

    const appPermission = permissions.filter(x => x.module === 'app_storing_startup');
    expect(appPermission).to.have.length(2);
    expect(appPermission.map(x => x.permission)).to.be.deep.eq(['basic2', 'with description2']);
  }


  @test
  async 'create initial roles'() {
    bootstrap = Bootstrap
      // .setConfigSources()
      .configure(<ITypexsOptions & any>{
        app: {path: __dirname + '/demo_storing/init_roles'},
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

    const defaultPermissions = permissions.filter(x => x.module === 'default');
    expect(defaultPermissions).to.have.length(5);

    const entityController = <EntityController>Container.get('EntityController.default');
    const roles = await entityController.find(Role, null, {limit: 0, subLimit: 0}) as Role[];

    const role = _.first(roles);
    expect(role.role).to.be.eq('demo_role');
    expect(role.label).to.be.eq('Demo role');
    const roleNames = role.permissions.map(x => x.permission);
    expect(roleNames).to.be.deep.eq([
      '*',
      'demo permission one',
      'demo permission three',
      'extra permission one',
      'extra permission two'
    ]);
  }

  @test
  async 'modifiy roles'() {
    bootstrap = Bootstrap
      // .setConfigSources()
      .configure(<ITypexsOptions & any>{
        app: {path: __dirname + '/demo_storing/init_roles'},
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

    const defaultPermissions = permissions.filter(x => x.module === 'default');
    expect(defaultPermissions).to.have.length(5);

    const entityController = <EntityController>Container.get('EntityController.default');
    let role = await entityController.findOne(Role, {rolename: 'demo_role'}, {limit: 0, subLimit: 0}) as Role;


    role.permissions = [
      permissions.find(x => x.permission === 'extra permission one'),
      permissions.find(x => x.permission === 'demo permission three'),
    ];

    await entityController.save(role);

    role = await entityController.findOne(Role, {rolename: 'demo_role'}, {limit: 0, subLimit: 0}) as Role;

    expect(role.role).to.be.eq('demo_role');
    expect(role.label).to.be.eq('Demo role');
    const roleNames = role.permissions.map(x => x.permission);
    expect(roleNames).to.be.deep.eq([
      'extra permission one',
      'demo permission three'
    ]);
  }

}
