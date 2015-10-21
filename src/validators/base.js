import { NotImplentedError } from 'exceptions';
import { ignorePrivateFunctions } from 'utils';


export default class BaseValidator {

  constructor(contents, filename) {
    this.contents = contents;
    this.filename = filename;
    this.validatorMessages = [];
    this._parsedContent = null;
    this._defaultRules = [];
  }

  scan(_rules=this._defaultRules) {
    return new Promise((resolve, reject) => {
      this.getContents()
        .then((contents) => {
          var promises = [];
          // Ignore private functions exported in rule files.
          //
          // (These are exported for testing purposes, but we don't want
          // to include them in our validator's rules.)
          var rules = ignorePrivateFunctions(_rules);

          for (let rule in rules) {
            let ruleFunction = rules[rule];

            // Make sure each rule is a function, just to be safe.
            if (typeof(ruleFunction) === 'function') {
              promises.push(ruleFunction(contents, this.filename,
                                         this.options));
            }
          }

          return Promise.all(promises);
        })
        .then((ruleResults) => {
          for (let messages of ruleResults) {
            this.validatorMessages = this.validatorMessages.concat(messages);
          }

          resolve(this.validatorMessages);
        })
        .catch(reject);
    });
  }

  getContents() {
    return new Promise((resolve, reject) => {
      if (this._parsedContent !== null) {
        return resolve(this._parsedContent);
      }

      this._getContents()
        .then((contents) => {
          this._parsedContent = contents;

          resolve(this._parsedContent);
        })
        .catch(reject);
    });
  }

  _getContents() {
    return new Promise((resolve, reject) => {
      reject(new NotImplentedError('_getContents is not implemented'));
    });
  }

}
