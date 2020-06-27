import {expect} from 'chai';
import {suite, test} from 'mocha-typescript';
import {BasicPermission} from '../../packages/typexs-roles-api/src';


@suite('functional/permission')
class PermissionSpec {

  @test()
  'basic'() {
    let p = new BasicPermission('test');
    expect(p.permission).to.be.eq('test');
    expect(p.type).to.be.eq('single');

    p = new BasicPermission('test * object');
    expect(p.permission).to.be.eq('test * object');
    expect(p.type).to.be.eq('pattern');

    p = new BasicPermission('test object');
    expect(p.permission).to.be.eq('test object');
    expect(p.type).to.be.eq('single');
  }

}
