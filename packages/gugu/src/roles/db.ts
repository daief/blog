import fs from 'fs-extra';
import _ from 'lodash';
import { dirname } from 'path';

export class DB<T extends {}> {
  private data: T;
  private filename: string;

  _: _.ObjectChain<T>;

  constructor(filename: string) {
    this.filename = filename;
  }

  readSync(defaults?: T) {
    const readResult = fs.readJSONSync(this.filename, {
      throws: false,
    });
    // this.data =
    //   defaults !== void 0
    //     ? _.merge(
    //         defaults,
    //         fs.readJSONSync(this.filename, {
    //           throws: false,
    //         }),
    //       )
    //     : readResult;

    this.data = defaults;

    this.data ||= null;
    this._ = _.chain(this.data);
    return this.data;
  }

  writeSync() {
    fs.mkdirpSync(dirname(this.filename));
    fs.writeJSONSync(this.filename, this._.value(), {});
  }
}
