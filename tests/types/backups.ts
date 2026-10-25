import {defineContentMigration,prepareBackupRestore,materializeBackupRestore} from '../../packages/galbox-sdk/src/backups/index.js';
import type {ContentMigration,PreparedBackupRestore} from '../../packages/galbox-sdk/src/backups/index.js';
import {parsePortableBackup} from '../../packages/galbox-sdk/src/protocol/index.js';
export function publicBackupTypes(input:unknown,program:unknown){
 const migration=defineContentMigration({id:'translation',gameId:'fixture',series:'one',fromReleases:['r1'],toRelease:'r2',migrate(backup){
  // @ts-expect-error Migration inputs are recursively readonly.
  backup.profiles[0]!.profile.read.push('guessed@v2');
  const output=parsePortableBackup(backup);output.release='r2';return output;
 }});
 const plan=prepareBackupRestore(input,{program,series:'one',migration});materializeBackupRestore(plan,{program,series:'one'});
 // @ts-expect-error A migration handle must come from the reviewed public factory.
 const forged:ContentMigration={id:'forged',fromReleases:['r1'],toRelease:'r2'};
 // @ts-expect-error Reports cannot fabricate prepared plan identity.
 const fake:PreparedBackupRestore={report:()=>plan.report()};
 void forged;void fake;
}
