// Imports
import type { Big } from "../deps.ts";
import { Base, base62, big } from "../deps.ts";
import { increment } from "./_increment.ts";
import {
	unpackCount,
	unpackService,
	unpackTimestamp,
	packCount,
	packService,
	packTimestamp,
} from "./_bits.ts";

/** The options that can be used in a shard. */
export interface ShardOptions
{
	/** The counter value to prevent duplicates. */
	count: number,
	
	/** The shard ID to prevent duplicates over multi-threaded services. */
	service: number,
	
	/** The shard's creation date. */
	timestamp: Date | number
};

/**
 * The shard option types.
 */
export type ShardConstructorOptions =
	| Partial<ShardOptions>
	| Shard
	| string
	| bigint
	;

/**
 * A unique identity for everyone and everything.
 */
export class Shard
{
	
	private _shard: bigint = 0n;
	
	/**
	 * Generate a new shard.
	 */
	public constructor ();
	
	/**
	 * Create a new shard with custom options.
	 * @param options The options.
	 */
	public constructor (options: Partial<ShardOptions>);
	
	/**
	 * Clone another shard.
	 * @param shard The shard to clone.
	 */
	public constructor (shard: Shard);
	
	/**
	 * Deconstruct a string into a shard object.
	 * @param representation The string representation.
	 */
	public constructor (representation: string);
	
	/**
	 * Deconstruct a string into a shard object, using a custom base.
	 * @param representation The string representation.
	 * @param base The base.
	 */
	public constructor (representation: string, base: Base);
	
	/**
	 * Deconstruct a string into a shard object, using a custom
	 * alphabet.
	 * @param representation The string representation.
	 * @param alphabet The alphabet.
	 */
	public constructor (representation: string, alphabet: string);
	
	/**
	 * Deconstruct a big integer into a shard object.
	 * @param representation The big integer representation.
	 */
	public constructor (representation: bigint);
	
	/**
	 * Generate, deconstruct a string or big integer representation
	 * into a shard, or generate a new shard.
	 * @param options The generation options.
	 * @param base The custom base or alphabet used to deconstruct a
	 *  string representation.
	 */
	public constructor (
		options?: ShardConstructorOptions,
		base: Base | string = base62
	) {
		if (typeof options === "string") options = Base.decode(options, base as string);
		if (options instanceof Shard)
		{
			this
				._count(BigInt(options.count()))
				._service(BigInt(options.service()))
				._timestamp(BigInt(options.timestamp()));
		} else if (typeof options === "bigint")
		{
			this
				._count(unpackCount(options))
				._service(unpackService(options))
				._timestamp(unpackTimestamp(options));
		} else
		{
			const count = typeof options === "object" && options !== null && typeof options.count === "number" ? options.count : increment();
			let timestamp: number;
			if (typeof options?.timestamp === "object")
			{
				timestamp = options.timestamp.getTime();
			} else if (typeof options?.timestamp === "number")
			{
				timestamp = options.timestamp
			} else
			{
				timestamp = Date.now()
			}
			this
				._count(BigInt(count))
				._service(BigInt(options?.service ?? 0))
				._timestamp(BigInt(timestamp));
		}
	}
	
	private _count (value: bigint): this
	{
		this._shard = packCount(this._shard, big(value));
		return this;
	}
	
	private _service (value: bigint): this
	{
		this._shard = packService(this._shard, big(value));
		return this;
	}
	
	private _timestamp (value: bigint): this
	{
		this._shard = packTimestamp(this._shard, big(new Date(typeof value === "bigint" ? Number(value) : value).getTime()));
		return this;
	}
	
	/**
	 * Get the shard as a number representative.
	 */
	public num (): bigint;
	
	/**
	 * Set the shard representative value.
	 * @param value The shard representative value.
	 */
	public num (value: bigint): this;
	
	/**
	 * Set or get the shard representative.
	 * @param value The optional shard representative value.
	 */
	public num (value?: bigint): bigint | this
	{
		if (value === undefined) return this._shard;
		this._shard = value;
		return this;
	}
	
	/**
	 * Get the shard represented as a string.
	 * @param base The base or alphabet to get the shard represented in.
	 */
	public str (base: Base | string = base62): string
	{
		return Base.encode(this._shard, base as string);
	}
	
	/**
	 * Get the count (random value) of this shard.
	 */
	public count (): number;
	
	/**
	 * Set the count (random value) on this shard.
	 * @param value The count or random value.
	 */
	public count (value: Big): this;
	
	/**
	 * Get or set the count (random value) from/on this shard.
	 * @param value The count or random value.
	 */
	public count (value?: Big): this | number
	{
		if (value === undefined) return Number(unpackCount(this._shard));
		this._shard = packCount(this._shard, big(value));
		return this;
	}
	
	/**
	 * Get the serviceID of the shard representative.
	 */
	public service (): number;
	
	/**
	 * Set the serviceId on this shard representative.
	 * @param value The shard/serviceID.
	 */
	public service (value: Big): this;
	
	/**
	 * Get or set the serviceID on this shard representative.
	 * @param value The shard/serviceID.
	 */
	public service (value?: Big): this | number
	{
		if (value === undefined) return Number(unpackService(this._shard));
		this._shard = packService(this._shard, big(value));
		return this;
	}
	
	/**
	 * Get the timestamp from this shard.
	 */
	public timestamp (): number;
	
	/**
	 * Set the timestamp on this shard object.
	 * @param value The date object or timestamp.
	 */
	public timestamp (value: Date | number | bigint | string): this;
	
	/**
	 * Get or set the timestamp on this shard.
	 * @param value The date object or timestamp.
	 */
	public timestamp (value?: Date | number | bigint | string): this | number
	{
		if (value === undefined) return Number(unpackTimestamp(this._shard));
		this._shard = packTimestamp(this._shard, big(new Date(typeof value === "bigint" ? Number(value) : value).getTime()));
		return this;
	}
	
	/**
	 * Get the timestamp as a date object.
	 */
	public date (): Date;
	
	/**
	 * Set the timestamp on this shard object.
	 * @param value The date object or timestamp.
	 */
	public date (value: Date | number | bigint | string): this;
	
	/**
	 * Get or set the date on this shard object.
	 * @param value The date object or timestamp.
	 */
	public date (value?: Date | number | bigint | string): this | Date
	{
		if (value === undefined) return new Date(this.timestamp());
		return this.timestamp(value);
	}
	
}
