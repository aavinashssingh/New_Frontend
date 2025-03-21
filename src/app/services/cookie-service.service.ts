import * as i0 from "@angular/core";
export declare type SameSite = "Lax" | "None" | "Strict";
export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: SameSite;
}

export declare class CookieService {
  private document;
  private platformId;
  private readonly documentIsAccessible;
  constructor(document: Document, platformId: any);
  /**
   * Get cookie Regular Expression
   *
   * @param name Cookie name
   * @returns property RegExp
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  private static getCookieRegExp;
  /**
   * Gets the unencoded version of an encoded component of a Uniform Resource Identifier (URI).
   *
   * @param encodedURIComponent A value representing an encoded URI component.
   *
   * @returns The unencoded version of an encoded component of a Uniform Resource Identifier (URI).
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  private static safeDecodeURIComponent;
  /**
   * Return `true` if {@link Document} is accessible, otherwise return `false`
   *
   * @param name Cookie name
   * @returns boolean - whether cookie with specified name exists
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  check(name: string): boolean;
  /**
   * Get cookies by name
   *
   * @param name Cookie name
   * @returns property value
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  get(name: string): string;
  /**
   * Get all cookies in JSON format
   *
   * @returns all the cookies in json
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  getAll(): {
    [key: string]: string;
  };
  /**
   * Set cookie based on provided information
   *
   * @param name     Cookie name
   * @param value    Cookie value
   * @param expires  Number of days until the cookies expires or an actual `Date`
   * @param path     Cookie path
   * @param domain   Cookie domain
   * @param secure   Secure flag
   * @param sameSite OWASP samesite token `Lax`, `None`, or `Strict`. Defaults to `Lax`
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  set(
    name: string,
    value: string,
    expires?: CookieOptions["expires"],
    path?: CookieOptions["path"],
    domain?: CookieOptions["domain"],
    secure?: CookieOptions["secure"],
    sameSite?: SameSite
  ): void;
  /**
   * Set cookie based on provided information
   *
   * Cookie's parameters:
   * <pre>
   * expires  Number of days until the cookies expires or an actual `Date`
   * path     Cookie path
   * domain   Cookie domain
   * secure   Secure flag
   * sameSite OWASP samesite token `Lax`, `None`, or `Strict`. Defaults to `Lax`
   * </pre>
   *
   * @param name     Cookie name
   * @param value    Cookie value
   * @param options  Body with cookie's params
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  set(name: string, value: string, options?: CookieOptions): void;
  /**
   * Delete cookie by name
   *
   * @param name   Cookie name
   * @param path   Cookie path
   * @param domain Cookie domain
   * @param secure Cookie secure flag
   * @param sameSite Cookie sameSite flag - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  delete(
    name: string,
    path?: CookieOptions["path"],
    domain?: CookieOptions["domain"],
    secure?: CookieOptions["secure"],
    sameSite?: SameSite
  ): void;
  /**
   * Delete all cookies
   *
   * @param path   Cookie path
   * @param domain Cookie domain
   * @param secure Is the Cookie secure
   * @param sameSite Is the cookie same site
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  deleteAll(
    path?: CookieOptions["path"],
    domain?: CookieOptions["domain"],
    secure?: CookieOptions["secure"],
    sameSite?: SameSite
  ): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<CookieService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<CookieService>;
}
