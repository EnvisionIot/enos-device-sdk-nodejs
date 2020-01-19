import {INodeStyleCallback} from '../interfaces';

/**
 * Converts method taking regular callback as a parameter to method returning a Promise
 */
export function callbackToPromise<TResult>(callbackOperation: (callback: INodeStyleCallback<TResult>) => void): Promise<TResult> {
  return new Promise<TResult>((resolve, reject) => {
    try {
      callbackOperation((error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      });
    } catch (error) {
      reject(error);
    }
  });
}
