import * as Utils from './utils';
import {Chunk} from './chunk';

/* Provides common big integer functions for use in JS
 * @val: string | number Requires a number or a string
 *                       to initialize the integer
 */
export class BigInteger {
    _repr: Chunk[];
    _chunkCnt: number;

    constructor (val: string | number) {
        this._repr = [];
        this._chunkCnt = 0;

        if (Utils.isNumber(val) || Utils.isString(val)) {
            // Create a new bigint from this

            let strVal: string;
            if (Utils.isNumber(val)) {
                strVal = Utils.reverseStr(val.toString());
            } else {
                strVal = Utils.reverseStr(val);
            }

            let length = strVal.length;
            for (let i=0; i<length; i+=Chunk.size) {
                this.addChunk(
                    (strVal.substr(i, Chunk.size)).split('').reverse().join(''));
            }

        } else {
            throw new TypeError('Bad type for BigInteger constructor');
        }
    }

    /* Print the chunks nicely, with optional delimiter
     * @delimiter: string? Optional delimiter to print between chunks
     */
    toString(delimiter: string = ''): string {
        let retval = this._repr.reverse().map(x => x.toString()).join(delimiter);
        this._repr.reverse();
        return retval;
    }

    /* Adds a new chunk of value val to the bigint
     * Warning, very horryfing behavarior with 0 passed as int
     * Prefer to use string.
     * @val: number | string Value (len<10) to be added to chunk
     */
    addChunk(val: number | string) {
        if (Utils.isNumber(val)) {
            this._repr.push(new Chunk((Math.floor(val)).toString()));
        } else {
            this._repr.push(new Chunk(val));
        }
        this._chunkCnt += 1;
    }

    private _addToChunk(index: number, value: number, carry: number) {
        while (index >= this._chunkCnt) {
            this.addChunk('0');
        }

        return this._repr[index].add(value, carry)
    }

    /* Adds a big integer to this integer
     * @b2: BigInteger The number to be added to this
     */
    add(b2: BigInteger) {
        let lastCarry = 0;
        for (let i=0; i<b2._chunkCnt; i++) {
            lastCarry = this._addToChunk(i, b2._repr[i]._bits, lastCarry);
        }

        let addingTo = b2._chunkCnt;
        while (lastCarry !== 0) {
            lastCarry = this._addToChunk(addingTo, 0, lastCarry);
            addingTo++;
        }
    }

    /* Stores product of n1, n2 in itself
     * @n1: BigInteger The first number in the product
     * @n2: BigInteger Second number in the product
     */
    multiply(n1: BigInteger,
             n2: BigInteger) {

        this._repr = [];
        this._chunkCnt = 0;

        for (let i=0; i<n2._chunkCnt; i++) {

            let plier = n2._repr[i];
            for (let j=0; j<n1._chunkCnt; j++) {
                let [res, rcar] =
                    Chunk.multiply(n1._repr[j], plier);
                this._addToChunk(j+i, res, 0);

                let addingTo = j+i+1;
                while (rcar !== 0) {
                    rcar = this._addToChunk(addingTo, 0, rcar);
                    addingTo++
                }
            }
        }
    }
}
