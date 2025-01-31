import { parseUser, request, Session, User, WithRawUser } from "./shared";

import type { Attributes, BaseResponse, fetchConfig } from "./shared";

export interface CreateRequest {
  email: string;
  password: string;
  session_duration_minutes?: number;
  session_custom_claims?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface CreateResponse extends BaseResponse {
  user_id: string;
  user: User;
  email_id: string;
  session_token?: string;
  session_jwt?: string;
  session?: Session;
}

export interface AuthenticateRequest {
  email: string;
  password: string;
  session_token?: string;
  session_jwt?: string;
  session_duration_minutes?: number;
  session_custom_claims?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface AuthenticateResponse extends BaseResponse {
  user_id: string;
  user: User;
  session_token?: string;
  session_jwt?: string;
  session?: Session;
}

export interface ResetByEmailStartRequest {
  email: string;
  login_redirect_url?: string;
  reset_password_redirect_url?: string;
  reset_password_expiration_minutes?: number;
  attributes?: Attributes;
  code_challenge?: string;
  locale?: string;
}

export interface ResetByEmailStartResponse extends BaseResponse {
  user_id: string;
  email_id: string;
}

export interface ResetByEmailRequest {
  options?: {
    ip_match_required?: boolean;
    user_agent_match_required?: boolean;
  };
  attributes?: Attributes;
  session_token?: string;
  session_jwt?: string;
  session_duration_minutes?: number;
  session_custom_claims?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  code_verifier?: string;
}

export interface ResetByEmailResponse extends BaseResponse {
  user_id: string;
  user: User;
  session_token?: string;
  session_jwt?: string;
  session?: Session;
}

export interface ResetByExistingPasswordRequest {
  email: string;
  existing_password: string;
  new_password: string;
  session_token?: string;
  session_jwt?: string;
  session_duration_minutes?: number;
  session_custom_claims?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface ResetByExistingPasswordResponse extends BaseResponse {
  user_id: string;
  user: User;
  session_token?: string;
  session_jwt?: string;
  session?: Session;
}

export interface ResetBySessionRequest {
  password: string;
  session_token?: string;
  session_jwt?: string;
}

export interface ResetBySessionResponse extends BaseResponse {
  user_id: string;
  user: User;
  session: Session;
}

export interface StrengthCheckRequest {
  email?: string;
  password: string;
}

export interface StrengthCheckResponse extends BaseResponse {
  valid_password: boolean;
  score: number;
  breached_password: boolean;
  feedback: {
    suggestions: string[];
    warning: string;
  };
}

interface MigrateRequestBase {
  email: string;
  hash: string;
}

interface MD5MigrateRequest extends MigrateRequestBase {
  hash_type: "md_5";
  md_5_config?: {
    prepend_salt?: string;
    append_salt?: string;
  };
}

interface BcryptMigrateRequest extends MigrateRequestBase {
  hash_type: "bcrypt";
}

interface Argon2IMigrateRequest extends MigrateRequestBase {
  hash_type: "argon_2i";
  argon_2_config?: {
    salt: string;
    iteration_amount: number;
    memory: number;
    threads: number;
    key_length: number;
  };
}

interface Argon2IDMigrateRequest extends MigrateRequestBase {
  hash_type: "argon_2id";
  argon_2_config?: {
    salt: string;
    iteration_amount: number;
    memory: number;
    threads: number;
    key_length: number;
  };
}

interface SHA1MigrateRequest extends MigrateRequestBase {
  hash_type: "sha_1";
  sha_1_config?: {
    prepend_salt?: string;
    append_salt?: string;
  };
}

interface ScryptMigrateRequest extends MigrateRequestBase {
  hash_type: "scrypt";
  scrypt_config?: {
    salt: string;
    n_parameter: number;
    r_parameter: number;
    p_parameter: number;
    key_length: number;
  };
}

export type MigrateRequest =
  | MD5MigrateRequest
  | BcryptMigrateRequest
  | Argon2IMigrateRequest
  | Argon2IDMigrateRequest
  | SHA1MigrateRequest
  | ScryptMigrateRequest;

export interface MigrateResponse extends BaseResponse {
  user_id: string;
  email_id: string;
  user_created: boolean;
}

export class Passwords {
  base_path = "passwords";

  private fetchConfig: fetchConfig;

  constructor(fetchConfig: fetchConfig) {
    this.fetchConfig = fetchConfig;
  }

  private endpoint(path: string): string {
    return `${this.base_path}/${path}`;
  }

  create(data: CreateRequest): Promise<CreateResponse> {
    return request(this.fetchConfig, {
      method: "POST",
      url: this.base_path,
      data: data,
    });
  }

  authenticate(data?: AuthenticateRequest): Promise<AuthenticateResponse> {
    return request<WithRawUser<AuthenticateResponse>>(this.fetchConfig, {
      method: "POST",
      url: this.endpoint("authenticate"),
      data: data,
    }).then((res) => {
      return {
        ...res,
        user: parseUser(res.user),
      };
    });
  }

  resetByEmailStart(
    data: ResetByEmailStartRequest
  ): Promise<ResetByEmailStartResponse> {
    return request(this.fetchConfig, {
      method: "POST",
      url: this.endpoint("email/reset/start"),
      data: data,
    });
  }

  resetByEmail(
    token: string,
    password: string,
    data?: ResetByEmailRequest
  ): Promise<ResetByEmailResponse> {
    return request(this.fetchConfig, {
      method: "POST",
      url: this.endpoint("email/reset"),
      data: { token, password, ...data },
    });
  }

  resetByExistingPassword(
    data: ResetByExistingPasswordRequest
  ): Promise<ResetByExistingPasswordResponse> {
    return request(this.fetchConfig, {
      method: "POST",
      url: this.endpoint("existing_password/reset"),
      data: data,
    });
  }

  resetBySession(data: ResetBySessionRequest): Promise<ResetBySessionResponse> {
    return request(this.fetchConfig, {
      method: "POST",
      url: this.endpoint("session/reset"),
      data: data,
    });
  }

  strengthCheck(data: StrengthCheckRequest): Promise<StrengthCheckResponse> {
    return request(this.fetchConfig, {
      method: "POST",
      url: this.endpoint("strength_check"),
      data: data,
    });
  }

  migrate(data: MigrateRequest): Promise<MigrateResponse> {
    return request(this.fetchConfig, {
      method: "POST",
      url: this.endpoint("migrate"),
      data: data,
    });
  }
}
