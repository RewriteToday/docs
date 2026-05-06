import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();

const authScopes = [
	'*',
	'project:read',
	'project:api_keys:read',
	'project:write',
	'project:webhooks:read',
	'project:templates:write',
	'project:templates:read',
	'project:webhooks:write',
	'message:write',
	'message:read',
	'project:logs:read',
];

const publicOperationScopes = [
	'project:read',
	'project:api_keys:read',
	'project:write',
	'project:webhooks:read',
	'project:templates:write',
	'project:templates:read',
	'project:webhooks:write',
	'message:write',
	'message:read',
	'project:logs:read',
];

const messageStatuses = [
	'SENT',
	'QUEUED',
	'FAILED',
	'CANCELED',
	'RECEIVED',
	'SCHEDULED',
	'DELIVERED',
];

const webhookEventTypes = [
	'sms.otp',
	'message.sent',
	'message.batch',
	'message.queued',
	'message.failed',
	'message.canceled',
	'message.delivered',
	'message.received',
	'message.scheduled',
];

const webhookDeliveryStatuses = ['FAILED', 'SUCCESS'];
const messageTypes = ['SMS', 'OTP'];
const messageEncoding = ['GSM7', 'UCS2'];
const messageAnalysisEncoding = ['gsm7', 'ucs2'];
const messageAnalysisReasons = ['fits', 'smart', 'singleLimit', 'nonGsm7'];

const exampleSnowflakes = {
	message: '748395130237498412',
	messageNext: '748395130237498413',
	messageThird: '748395130237498414',
	contact: '748395130237498515',
	contactNext: '748395130237498516',
	segment: '748395130237498560',
	template: '748395130237498620',
	webhook: '748395130237498750',
	log: '748395130237498880',
	logNext: '748395130237498881',
	apiKey: '748395130237498990',
	otp: '748395130237499120',
	project: '748395130237499220',
};

const exampleTimestamps = {
	createdAt: '2026-03-20T14:22:31.562Z',
	scheduledAt: '2026-03-20T14:30:00.000Z',
	deliveredAt: '2026-03-20T14:22:39.914Z',
	expiresAt: '2026-03-20T14:27:31.562Z',
	verifiedAt: '2026-03-20T14:23:18.000Z',
	retryAt: '2026-03-20T14:25:00.000Z',
};

const exampleMessageAnalysis = {
	characters: 28,
	encoding: 'gsm7',
	segments: {
		concat: 153,
		count: 1,
		reason: 'fits',
		single: 160,
	},
};

const exampleCursor = {
	persist: true,
	after: exampleSnowflakes.messageThird,
};

const exampleMetadata = {
	flow: 'login',
	origin: 'checkout',
};

const exampleMessageInlineBody = {
	to: '+5511999999999',
	content: 'Rewrite: seu codigo e 478201',
	tags: exampleMetadata,
	scheduledAt: exampleTimestamps.scheduledAt,
	segmentation: {
		max: 2,
		mode: 'send',
		smart: true,
	},
};

const exampleMessageInlineContactBody = {
	contact: 'Fernanda',
	content: 'Rewrite: seu codigo e 478201',
	tags: exampleMetadata,
};

const exampleMessageTemplateBody = {
	to: '+5511888888888',
	templateId: exampleSnowflakes.template,
	variables: {
		code: '941205',
		name: 'Fernanda',
	},
	tags: exampleMetadata,
};

const exampleMessageTemplateContactBody = {
	contact: exampleSnowflakes.contact,
	templateId: exampleSnowflakes.template,
	variables: {
		code: '941205',
		name: 'Fernanda',
	},
	tags: exampleMetadata,
};

const exampleOTPPhoneBody = {
	to: '+5511999999999',
	prefix: 'Rewrite',
	expiresIn: 5,
};

const exampleOTPContactBody = {
	contact: 'Fernanda',
	prefix: 'Rewrite',
	expiresIn: 5,
};

const exampleMessageCreateResult = {
	id: exampleSnowflakes.message,
	createdAt: exampleTimestamps.createdAt,
	analysis: exampleMessageAnalysis,
	sandbox: false,
};

const exampleMessageRecord = {
	id: exampleSnowflakes.message,
	createdAt: exampleTimestamps.createdAt,
	contact: 'Fernanda',
	contactId: exampleSnowflakes.contact,
	to: '+5511999999999',
	from: null,
	type: 'SMS',
	tags: exampleMetadata,
	status: 'DELIVERED',
	country: 'br',
	content: 'Rewrite: seu codigo e 478201',
	encoding: 'GSM7',
	templateId: null,
	deliveredAt: exampleTimestamps.deliveredAt,
	scheduledAt: null,
	sandbox: false,
};

const exampleContactRecord = {
	id: exampleSnowflakes.contact,
	createdAt: exampleTimestamps.createdAt,
	name: 'Fernanda',
	phone: '+5511999999999',
	country: 'br',
	channel: 'SMS',
	preferredLanguages: ['br', 'us'],
	tags: {
		flow: 'checkout',
		origin: 'import',
	},
	sandbox: false,
	updatedAt: exampleTimestamps.createdAt,
};

const exampleSegmentRecord = {
	id: exampleSnowflakes.segment,
	createdAt: exampleTimestamps.createdAt,
	name: 'vip-customers',
	description: 'Customers with priority transactional flows.',
	color: '#0EA5E9',
	contactsCount: 12,
	sandbox: false,
	updatedAt: exampleTimestamps.createdAt,
};

const exampleTagRecord = {
	id: '748395130237498570',
	createdAt: exampleTimestamps.createdAt,
	name: 'vip',
	description: 'Contacts prioritized for transactional messaging.',
	color: '#F97316',
	contactsCount: 12,
};

const exampleAPIKeyRecord = {
	id: exampleSnowflakes.apiKey,
	name: 'primary',
	prefix: 'rw_d5f3ce',
	scopes: ['message:write', 'message:read', 'project:logs:read'],
	description: 'Main server key used by production messaging flows.',
	lastUsedAt: exampleTimestamps.deliveredAt,
	createdAt: exampleTimestamps.createdAt,
};

const exampleAPIKeyCreateResult = {
	id: exampleSnowflakes.apiKey,
	key: 'rw_d5f3ce.4pbbWQrluH4SOD5xvR9p9C2x',
	createdAt: exampleTimestamps.createdAt,
};

const exampleContactBatchResult = {
	inserted: 2,
	updated: 0,
	ignored: 0,
	total: 2,
};

const exampleTemplateVariable = {
	name: 'code',
	fallback: '478201',
};

const exampleTemplateRecord = {
	id: exampleSnowflakes.template,
	name: 'login_code',
	content: 'Rewrite: seu codigo e {{code}}',
	i18n: {
		br: 'Rewrite: seu codigo e {{code}}',
	},
	variables: [exampleTemplateVariable],
	tags: {
		flow: 'otp',
		channel: 'login',
	},
	description: 'Template usado no fluxo de login',
	createdAt: exampleTimestamps.createdAt,
};

const exampleWebhookRecord = {
	id: exampleSnowflakes.webhook,
	name: 'delivery-events',
	events: ['message.sent', 'message.failed', 'message.received', 'sms.otp'],
	isEnabled: true,
	sandbox: false,
	endpoint: 'https://example.com/rewrite/webhooks',
	retries: 2,
	timeout: 3000,
	lastDeliveryAt: exampleTimestamps.deliveredAt,
	createdAt: exampleTimestamps.createdAt,
};

const exampleWebhookEvent = {
	id: exampleSnowflakes.log,
	createdAt: exampleTimestamps.createdAt,
	type: 'message.sent',
	sandbox: false,
	data: {
		id: exampleSnowflakes.message,
		projectId: exampleSnowflakes.project,
		contact: 'Fernanda',
		contactId: exampleSnowflakes.contact,
		to: '+5511999999999',
		tags: exampleMetadata,
		type: 'SMS',
		status: 'SENT',
		content: 'Rewrite: seu codigo e 478201',
		country: 'br',
		analysis: exampleMessageAnalysis,
		error: null,
		deliveredAt: null,
		scheduledAt: null,
		templateId: null,
		sandbox: false,
	},
};

const exampleDeliverySummary = {
	id: exampleSnowflakes.log,
	url: 'https://example.com/rewrite/webhooks',
	type: 'message.sent',
	code: 200,
	error: null,
	status: 'SUCCESS',
	attempt: 1,
	latency: 182,
	retryAt: null,
	createdAt: exampleTimestamps.createdAt,
	messageId: exampleSnowflakes.message,
	sandbox: false,
};

const exampleDeliveryDetail = {
	...exampleDeliverySummary,
	payload: exampleWebhookEvent,
	webhookId: exampleSnowflakes.webhook,
};

const exampleCompactDelivery = {
	id: exampleSnowflakes.log,
	url: 'https://example.com/rewrite/webhooks',
	code: 200,
	webhookId: exampleSnowflakes.webhook,
	messageId: exampleSnowflakes.message,
	sandbox: false,
	createdAt: exampleTimestamps.createdAt,
};

const exampleRequestLogSummary = {
	id: exampleSnowflakes.log,
	method: 'POST',
	endpoint: '/messages',
	status: 200,
	source: 'API',
	sandbox: false,
	createdAt: exampleTimestamps.createdAt,
};

const exampleRequestLogDetail = {
	...exampleRequestLogSummary,
	ip: '203.0.113.10',
	projectId: exampleSnowflakes.project,
	apiKeyId: exampleSnowflakes.apiKey,
	requestBody: {
		to: '+5511999999999',
		content: 'Rewrite: seu codigo e 478201',
	},
	responseBody: {
		ok: true,
		data: exampleMessageCreateResult,
	},
};

const info = {
	title: 'Rewrite API',
	version: '1.0.0',
	summary: 'Project-level API reference for Rewrite v1.',
	description:
		'Reference for the externally supported API-key-accessible endpoints in Rewrite API v1.\n\nAll successful responses use the `ok` / `data` envelope. Paginated list endpoints return `cursor` at the top level.',
};

const securitySchemeName = (scope) => `apiKey.${scope.replaceAll(':', '.')}`;
const securityRequirement = (scope) => [{ [securitySchemeName(scope)]: [] }];

const servers = [
	{
		url: 'https://api.rewritetoday.com/v1',
		description: 'Production',
	},
];

const baseComponents = {
	securitySchemes: {
		...Object.fromEntries(
			publicOperationScopes.map((scope) => [
				securitySchemeName(scope),
				{
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'API key',
					description: `Send your API key as \`Authorization: Bearer rw_...\`.\n\nRequired scope: \`${scope}\`.`,
				},
			]),
		),
	},
	parameters: {
		IdempotencyKey: {
			name: 'Idempotency-Key',
			in: 'header',
			required: false,
			description:
				'Optional key used to safely retry the same create request without creating duplicates.',
			schema: {
				type: 'string',
				minLength: 1,
				maxLength: 64,
				example: 'msg:login-otp:2026-03-20T14:22',
			},
		},
		After: {
			name: 'after',
			in: 'query',
			required: false,
			description:
				'Cursor for forward pagination. Send exactly one of `after` or `before` when paginating.',
			schema: {
				$ref: '#/components/schemas/Snowflake',
			},
		},
		Before: {
			name: 'before',
			in: 'query',
			required: false,
			description:
				'Cursor for backward pagination. Send exactly one of `after` or `before` when paginating.',
			schema: {
				$ref: '#/components/schemas/Snowflake',
			},
		},
		Limit: {
			name: 'limit',
			in: 'query',
			required: false,
			description:
				'Page size. Backend cursor schemas validate this between `2` and the route-specific maximum.',
			schema: {
				type: 'integer',
				minimum: 2,
				maximum: 100,
			},
		},
		WithI18n: {
			name: 'withi18n',
			in: 'query',
			required: false,
			description:
				'When `true`, include the template `i18n` map in list/detail responses.',
			schema: {
				type: 'boolean',
			},
		},
		MessageStatus: {
			name: 'status',
			in: 'query',
			required: false,
			description: 'Filter by message status.',
			schema: {
				type: 'string',
				enum: messageStatuses,
			},
		},
		MessageEncoding: {
			name: 'encoding',
			in: 'query',
			required: false,
			description: 'Filter by message encoding.',
			schema: {
				type: 'string',
				enum: messageEncoding,
			},
		},
		MessageScheduled: {
			name: 'scheduled',
			in: 'query',
			required: false,
			description: 'Filter by whether the message has `scheduledAt` set.',
			schema: {
				type: 'boolean',
			},
		},
		MessageWithCounts: {
			name: 'withCounts',
			in: 'query',
			required: false,
			description:
				'When `true`, include a top-level `count` field with the total matching records.',
			schema: {
				type: 'boolean',
			},
		},
		CountryCode: {
			name: 'country',
			in: 'query',
			required: false,
			description:
				'Lowercase ISO 3166-1 alpha-2 country code inferred from the destination number.',
			schema: {
				type: 'string',
				example: 'br',
			},
		},
		WebhookEventTypeRequired: {
			name: 'type',
			in: 'query',
			required: false,
			description: 'Filter by webhook event type.',
			schema: {
				type: 'string',
				enum: webhookEventTypes,
			},
		},
		WebhookDeliveryStatusRequired: {
			name: 'status',
			in: 'query',
			required: false,
			description: 'Filter by webhook delivery status.',
			schema: {
				type: 'string',
				enum: webhookDeliveryStatuses,
			},
		},
		WebhookDeliveryStatus: {
			name: 'status',
			in: 'query',
			required: false,
			description: 'Filter by webhook delivery status.',
			schema: {
				type: 'string',
				enum: webhookDeliveryStatuses,
			},
		},
		HTTPStatusCode: {
			name: 'code',
			in: 'query',
			required: false,
			description: 'Filter by HTTP status code.',
			schema: {
				type: 'integer',
				minimum: 100,
				maximum: 600,
			},
		},
		WebhookAttempt: {
			name: 'attempt',
			in: 'query',
			required: false,
			description: 'Filter by delivery attempt number.',
			schema: {
				type: 'integer',
				minimum: 1,
				maximum: 5,
			},
		},
		MessageId: {
			name: 'messageId',
			in: 'query',
			required: false,
			description: 'Filter by message identifier.',
			schema: {
				$ref: '#/components/schemas/Snowflake',
			},
		},
		WebhookId: {
			name: 'webhookId',
			in: 'query',
			required: false,
			description: 'Filter by webhook identifier.',
			schema: {
				$ref: '#/components/schemas/Snowflake',
			},
		},
		LogMethod: {
			name: 'method',
			in: 'query',
			required: false,
			description: 'Filter by HTTP method.',
			schema: {
				type: 'string',
				example: 'POST',
			},
		},
		LogEndpoint: {
			name: 'endpoint',
			in: 'query',
			required: false,
			description: 'Filter by request endpoint path.',
			schema: {
				type: 'string',
				example: '/messages',
			},
		},
	},
	responses: {
		BadRequest: {
			description: 'Bad request',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/ErrorResponse',
					},
				},
			},
		},
		Unauthorized: {
			description: 'Unauthorized',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/ErrorResponse',
					},
				},
			},
		},
		Forbidden: {
			description: 'Forbidden',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/ErrorResponse',
					},
				},
			},
		},
		NotFound: {
			description: 'Not found',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/ErrorResponse',
					},
				},
			},
		},
		TooManyRequests: {
			description:
				'Rate limited. The backend sends `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Retry-After` and `X-RateLimit-Retry-Policy`. `X-RateLimit-Retry-After` is returned in milliseconds.',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/ErrorResponse',
					},
				},
			},
		},
		InternalServerError: {
			description: 'Internal server error',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/ErrorResponse',
					},
				},
			},
		},
	},
	schemas: {
		Snowflake: {
			type: 'string',
			example: '748395130237498412',
		},
		Cursor: {
			type: 'object',
			required: ['persist'],
			additionalProperties: false,
			properties: {
				persist: {
					type: 'boolean',
					description:
						'When `true`, another page is available using the returned cursor values.',
				},
				after: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Cursor to request the next page.',
				},
				before: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Cursor to request the previous page.',
				},
			},
			example: exampleCursor,
		},
		ErrorResponse: {
			type: 'object',
			required: ['ok', 'error'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: false,
				},
				error: {
					type: 'object',
					required: ['code', 'message'],
					additionalProperties: false,
					properties: {
						code: {
							type: 'string',
							example: 'INVALID_JSON_BODY',
						},
						message: {
							type: 'string',
							example: 'Invalid JSON body',
						},
						detailed: {
							type: 'object',
							additionalProperties: true,
						},
					},
				},
			},
		},
		OkEmptyResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					type: 'null',
				},
			},
		},
		OkArrayResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					type: 'array',
					items: {
						$ref: '#/components/schemas/Snowflake',
					},
				},
			},
		},
		Project: {
			type: 'object',
			required: ['id', 'name', 'icon', 'ownerId', 'apiKeysCount', 'createdAt'],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
				},
				name: {
					type: 'string',
					example: 'Rewrite',
				},
				icon: {
					type: ['string', 'null'],
				},
				ownerId: {
					$ref: '#/components/schemas/Snowflake',
				},
				apiKeysCount: {
					type: 'integer',
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
				},
			},
		},
		ProjectUpdateBody: {
			type: 'object',
			additionalProperties: false,
			properties: {
				icon: {
					type: 'null',
					description: 'Send `null` to remove the icon.',
				},
				name: {
					type: 'string',
					example: 'Rewrite',
				},
			},
		},
		ProjectCreateBody: {
			type: 'object',
			required: ['name'],
			additionalProperties: false,
			properties: {
				name: {
					type: 'string',
					example: 'Rewrite',
				},
			},
		},
		ProjectResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/Project',
				},
			},
		},
		AuthScope: {
			type: 'string',
			enum: authScopes,
		},
		APIKey: {
			type: 'object',
			required: [
				'id',
				'name',
				'prefix',
				'scopes',
				'lastUsedAt',
				'description',
				'createdAt',
			],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					example: exampleAPIKeyRecord.id,
				},
				name: {
					type: 'string',
					example: exampleAPIKeyRecord.name,
				},
				prefix: {
					type: 'string',
					example: exampleAPIKeyRecord.prefix,
				},
				scopes: {
					type: 'array',
					items: {
						$ref: '#/components/schemas/AuthScope',
					},
					example: exampleAPIKeyRecord.scopes,
				},
				description: {
					type: ['string', 'null'],
					example: exampleAPIKeyRecord.description,
				},
				lastUsedAt: {
					type: ['string', 'null'],
					format: 'date-time',
					example: exampleAPIKeyRecord.lastUsedAt,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					example: exampleAPIKeyRecord.createdAt,
				},
			},
			example: exampleAPIKeyRecord,
		},
		APIKeyListResponse: {
			type: 'object',
			required: ['ok', 'data', 'cursor'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					type: 'array',
					items: {
						$ref: '#/components/schemas/APIKey',
					},
				},
				cursor: {
					$ref: '#/components/schemas/Cursor',
				},
			},
		},
		APIKeyResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/APIKey',
				},
			},
		},
		APIKeyCreateBody: {
			type: 'object',
			required: ['name'],
			additionalProperties: false,
			properties: {
				name: {
					type: 'string',
					minLength: 2,
					maxLength: 32,
					example: exampleAPIKeyRecord.name,
				},
				description: {
					type: 'string',
					minLength: 1,
					maxLength: 64,
					example: exampleAPIKeyRecord.description,
				},
				scopes: {
					type: 'array',
					uniqueItems: true,
					items: {
						$ref: '#/components/schemas/AuthScope',
					},
					example: exampleAPIKeyRecord.scopes,
				},
			},
			example: {
				name: exampleAPIKeyRecord.name,
				description: exampleAPIKeyRecord.description,
				scopes: exampleAPIKeyRecord.scopes,
			},
		},
		APIKeyUpdateBody: {
			type: 'object',
			additionalProperties: false,
			properties: {
				name: {
					type: 'string',
					minLength: 2,
					maxLength: 32,
					example: 'secondary',
				},
				description: {
					type: ['string', 'null'],
					minLength: 1,
					maxLength: 64,
					example: 'Secondary key used by background jobs.',
				},
				scopes: {
					type: 'array',
					uniqueItems: true,
					items: {
						$ref: '#/components/schemas/AuthScope',
					},
					example: ['message:read', 'project:logs:read'],
				},
			},
			example: {
				description: 'Secondary key used by background jobs.',
				scopes: ['message:read', 'project:logs:read'],
			},
		},
		APIKeyCreateResult: {
			type: 'object',
			required: ['id', 'key', 'createdAt'],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
				},
				key: {
					type: 'string',
					description: 'Returned once. Persist it immediately.',
					example: exampleAPIKeyCreateResult.key,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					example: exampleAPIKeyCreateResult.createdAt,
				},
			},
			example: exampleAPIKeyCreateResult,
		},
		ContactTagIdsBody: {
			type: 'object',
			required: ['ids'],
			additionalProperties: false,
			properties: {
				ids: {
					type: 'array',
					minItems: 1,
					maxItems: 15,
					uniqueItems: true,
					items: {
						$ref: '#/components/schemas/Snowflake',
					},
					example: [exampleTagRecord.id],
				},
			},
			example: {
				ids: [exampleTagRecord.id],
			},
		},
		APIKeyCreateResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/APIKeyCreateResult',
				},
			},
		},
		ContactCreateBody: {
			type: 'object',
			required: ['phone'],
			additionalProperties: false,
			properties: {
				phone: {
					type: 'string',
					minLength: 8,
					description:
						'Destination number stored in E.164 format after normalization.',
					example: exampleContactRecord.phone,
				},
				name: {
					type: 'string',
					minLength: 1,
					maxLength: 80,
					description:
						'Optional human-readable label used to look up the contact later.',
					example: exampleContactRecord.name,
				},
				channel: {
					type: 'string',
					enum: messageTypes,
					description:
						'Optional preferred channel for future contact-based sends.',
					example: exampleContactRecord.channel,
				},
				tagIds: {
					type: 'array',
					maxItems: 15,
					uniqueItems: true,
					items: {
						$ref: '#/components/schemas/Snowflake',
					},
					description:
						'Optional tag identifiers attached to the contact on creation.',
					example: [exampleTagRecord.id],
				},
				tags: {
					type: 'object',
					additionalProperties: true,
					description: 'Arbitrary metadata stored with the contact.',
					example: exampleContactRecord.tags,
				},
				preferredLanguages: {
					type: 'array',
					uniqueItems: true,
					items: {
						type: 'string',
					},
					description:
						'Preferred locale codes used when targeting this contact with localized flows.',
					example: exampleContactRecord.preferredLanguages,
				},
			},
			example: {
				phone: exampleContactRecord.phone,
				name: exampleContactRecord.name,
				channel: exampleContactRecord.channel,
				tagIds: [exampleTagRecord.id],
				tags: exampleContactRecord.tags,
				preferredLanguages: exampleContactRecord.preferredLanguages,
			},
		},
		ContactUpdateBody: {
			type: 'object',
			additionalProperties: false,
			properties: {
				phone: {
					type: 'string',
					minLength: 8,
					description:
						'Updated destination number. Rewrite normalizes it before persisting.',
					example: '+5511888888888',
				},
				name: {
					type: 'string',
					minLength: 1,
					maxLength: 80,
					description: 'Updated contact label.',
					example: 'Fernanda Silva',
				},
				channel: {
					type: 'string',
					enum: messageTypes,
					description: 'Updated preferred channel.',
					example: 'OTP',
				},
				tagIds: {
					type: 'array',
					maxItems: 15,
					uniqueItems: true,
					items: {
						$ref: '#/components/schemas/Snowflake',
					},
					description:
						'Replacement tag set linked to the contact. Existing relations are synchronized.',
					example: [exampleTagRecord.id],
				},
				tags: {
					type: 'object',
					additionalProperties: true,
					description: 'Replacement metadata stored with the contact.',
					example: {
						flow: 'otp-login',
						origin: 'signup',
					},
				},
				preferredLanguages: {
					type: 'array',
					uniqueItems: true,
					items: {
						type: 'string',
					},
					description: 'Updated locale preference list for the contact.',
					example: ['br'],
				},
			},
			example: {
				name: 'Fernanda Silva',
				tagIds: [exampleTagRecord.id],
				tags: {
					flow: 'otp-login',
					origin: 'signup',
				},
				preferredLanguages: ['br'],
			},
		},
		ContactCreateResult: {
			type: 'object',
			required: ['id', 'phone', 'country', 'createdAt', 'sandbox'],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Contact identifier returned by Rewrite.',
				},
				phone: {
					type: 'string',
					description: 'Normalized destination number stored for the contact.',
					example: exampleContactRecord.phone,
				},
				country: {
					type: 'string',
					description: 'Country inferred from the normalized number.',
					example: exampleContactRecord.country,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when the contact was created.',
					example: exampleContactRecord.createdAt,
				},
				sandbox: {
					type: 'boolean',
					description: 'Whether the contact was created under sandbox mode.',
					example: exampleContactRecord.sandbox,
				},
			},
			example: {
				id: exampleContactRecord.id,
				phone: exampleContactRecord.phone,
				country: exampleContactRecord.country,
				createdAt: exampleContactRecord.createdAt,
				sandbox: exampleContactRecord.sandbox,
			},
		},
		Contact: {
			type: 'object',
			required: [
				'id',
				'createdAt',
				'name',
				'phone',
				'country',
				'channel',
				'preferredLanguages',
				'tags',
				'sandbox',
				'updatedAt',
			],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when the contact was created.',
					example: exampleContactRecord.createdAt,
				},
				name: {
					type: ['string', 'null'],
					description: 'Stored contact label.',
					example: exampleContactRecord.name,
				},
				phone: {
					type: 'string',
					description: 'Normalized destination number stored for the contact.',
					example: exampleContactRecord.phone,
				},
				country: {
					type: 'string',
					description: 'Country inferred from the normalized number.',
					example: exampleContactRecord.country,
				},
				channel: {
					type: ['string', 'null'],
					enum: [...messageTypes, null],
					description:
						'Preferred channel saved with the contact, when configured.',
					example: exampleContactRecord.channel,
				},
				preferredLanguages: {
					type: 'array',
					items: {
						type: 'string',
					},
					description: 'Preferred locale codes stored with the contact.',
					example: exampleContactRecord.preferredLanguages,
				},
				tags: {
					type: 'object',
					additionalProperties: true,
					description: 'Arbitrary metadata stored with the contact.',
					example: exampleContactRecord.tags,
				},
				sandbox: {
					type: 'boolean',
					description: 'Whether the contact belongs to a sandbox flow.',
					example: exampleContactRecord.sandbox,
				},
				updatedAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when the contact was last updated.',
					example: exampleContactRecord.updatedAt,
				},
			},
			example: exampleContactRecord,
		},
		ContactResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/Contact',
				},
			},
		},
		ContactCreateResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/ContactCreateResult',
				},
			},
		},
		ContactListResponse: {
			type: 'object',
			required: ['ok', 'data', 'cursor'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					type: 'array',
					items: {
						$ref: '#/components/schemas/Contact',
					},
				},
				cursor: {
					$ref: '#/components/schemas/Cursor',
				},
			},
		},
		ContactBatchResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					type: 'object',
					required: ['inserted', 'updated', 'ignored', 'total'],
					additionalProperties: false,
					properties: {
						inserted: {
							type: 'integer',
							example: exampleContactBatchResult.inserted,
						},
						updated: {
							type: 'integer',
							example: exampleContactBatchResult.updated,
						},
						ignored: {
							type: 'integer',
							example: exampleContactBatchResult.ignored,
						},
						total: {
							type: 'integer',
							example: exampleContactBatchResult.total,
						},
					},
					example: exampleContactBatchResult,
				},
			},
		},
		SegmentCreateBody: {
			type: 'object',
			required: ['name'],
			additionalProperties: false,
			properties: {
				name: {
					type: 'string',
					minLength: 1,
					maxLength: 80,
					description: 'Unique segment name inside the current project.',
					example: exampleSegmentRecord.name,
				},
				description: {
					type: ['string', 'null'],
					minLength: 1,
					maxLength: 280,
					description: 'Optional description for operators and dashboards.',
					example: exampleSegmentRecord.description,
				},
				color: {
					type: ['string', 'null'],
					pattern: '^#[0-9A-Fa-f]{6}$',
					description:
						'Optional hexadecimal accent color stored with the segment.',
					example: exampleSegmentRecord.color,
				},
			},
			example: {
				name: exampleSegmentRecord.name,
				description: exampleSegmentRecord.description,
				color: exampleSegmentRecord.color,
			},
		},
		SegmentUpdateBody: {
			type: 'object',
			additionalProperties: false,
			properties: {
				name: {
					type: 'string',
					minLength: 1,
					maxLength: 80,
					description: 'Updated segment name.',
					example: 'priority-customers',
				},
				description: {
					type: ['string', 'null'],
					minLength: 1,
					maxLength: 280,
					description: 'Updated description.',
					example:
						'Customers that must always receive high-priority messaging.',
				},
				color: {
					type: ['string', 'null'],
					pattern: '^#[0-9A-Fa-f]{6}$',
					description: 'Updated hexadecimal accent color.',
					example: '#2563EB',
				},
			},
			example: {
				description:
					'Customers that must always receive high-priority messaging.',
				color: '#2563EB',
			},
		},
		SegmentAttachContactBody: {
			type: 'object',
			required: ['contactId'],
			additionalProperties: false,
			properties: {
				contactId: {
					$ref: '#/components/schemas/Snowflake',
					description:
						'Contact identifier that should be attached to the segment.',
					example: exampleContactRecord.id,
				},
			},
			example: {
				contactId: exampleContactRecord.id,
			},
		},
		SegmentCreateResult: {
			type: 'object',
			required: [
				'id',
				'name',
				'description',
				'contactsCount',
				'sandbox',
				'updatedAt',
				'createdAt',
			],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
				},
				name: {
					type: 'string',
					example: exampleSegmentRecord.name,
				},
				description: {
					type: ['string', 'null'],
					example: exampleSegmentRecord.description,
				},
				contactsCount: {
					type: 'integer',
					description: 'Current number of contacts attached to the segment.',
					example: 0,
				},
				sandbox: {
					type: 'boolean',
					description: 'Whether the segment was created under sandbox mode.',
					example: exampleSegmentRecord.sandbox,
				},
				updatedAt: {
					type: 'string',
					format: 'date-time',
					example: exampleSegmentRecord.updatedAt,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					example: exampleSegmentRecord.createdAt,
				},
			},
			example: {
				id: exampleSegmentRecord.id,
				name: exampleSegmentRecord.name,
				description: exampleSegmentRecord.description,
				contactsCount: 0,
				sandbox: exampleSegmentRecord.sandbox,
				updatedAt: exampleSegmentRecord.updatedAt,
				createdAt: exampleSegmentRecord.createdAt,
			},
		},
		Segment: {
			type: 'object',
			required: [
				'id',
				'createdAt',
				'name',
				'description',
				'color',
				'contactsCount',
				'sandbox',
				'updatedAt',
			],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					example: exampleSegmentRecord.createdAt,
				},
				name: {
					type: 'string',
					description: 'Segment name unique inside the project.',
					example: exampleSegmentRecord.name,
				},
				description: {
					type: ['string', 'null'],
					description: 'Optional description stored with the segment.',
					example: exampleSegmentRecord.description,
				},
				color: {
					type: ['string', 'null'],
					description: 'Optional hexadecimal accent color.',
					example: exampleSegmentRecord.color,
				},
				contactsCount: {
					type: 'integer',
					description: 'Current number of contacts attached to the segment.',
					example: exampleSegmentRecord.contactsCount,
				},
				sandbox: {
					type: 'boolean',
					description: 'Whether the segment belongs to a sandbox flow.',
					example: exampleSegmentRecord.sandbox,
				},
				updatedAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when the segment was last updated.',
					example: exampleSegmentRecord.updatedAt,
				},
			},
			example: exampleSegmentRecord,
		},
		SegmentResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/Segment',
				},
			},
		},
		SegmentCreateResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/SegmentCreateResult',
				},
			},
		},
		SegmentListResponse: {
			type: 'object',
			required: ['ok', 'data', 'cursor'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					type: 'array',
					items: {
						$ref: '#/components/schemas/Segment',
					},
				},
				cursor: {
					$ref: '#/components/schemas/Cursor',
				},
			},
		},
		TagCreateBody: {
			type: 'object',
			required: ['name'],
			additionalProperties: false,
			properties: {
				name: {
					type: 'string',
					minLength: 1,
					maxLength: 64,
					example: exampleTagRecord.name,
				},
				color: {
					type: 'string',
					pattern: '^#[0-9A-Fa-f]{6}$',
					example: exampleTagRecord.color,
				},
				description: {
					type: 'string',
					minLength: 1,
					maxLength: 128,
					example: exampleTagRecord.description,
				},
			},
			example: {
				name: exampleTagRecord.name,
				color: exampleTagRecord.color,
				description: exampleTagRecord.description,
			},
		},
		TagUpdateBody: {
			type: 'object',
			additionalProperties: false,
			properties: {
				name: {
					type: 'string',
					minLength: 1,
					maxLength: 64,
					example: 'priority-vip',
				},
				color: {
					type: 'string',
					pattern: '^#[0-9A-Fa-f]{6}$',
					example: '#EA580C',
				},
				description: {
					type: 'string',
					minLength: 1,
					maxLength: 128,
					example: 'Updated description for priority contacts.',
				},
			},
			example: {
				color: '#EA580C',
				description: 'Updated description for priority contacts.',
			},
		},
		TagCreateResult: {
			type: 'object',
			required: ['id', 'slug', 'createdAt'],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					example: exampleTagRecord.id,
				},
				slug: {
					type: 'string',
					example: 'vip',
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					example: exampleTagRecord.createdAt,
				},
			},
			example: {
				id: exampleTagRecord.id,
				slug: 'vip',
				createdAt: exampleTagRecord.createdAt,
			},
		},
		Tag: {
			type: 'object',
			required: [
				'id',
				'name',
				'color',
				'description',
				'contactsCount',
				'createdAt',
			],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					example: exampleTagRecord.id,
				},
				name: {
					type: 'string',
					example: exampleTagRecord.name,
				},
				color: {
					type: ['string', 'null'],
					example: exampleTagRecord.color,
				},
				description: {
					type: ['string', 'null'],
					example: exampleTagRecord.description,
				},
				contactsCount: {
					type: 'integer',
					example: exampleTagRecord.contactsCount,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					example: exampleTagRecord.createdAt,
				},
			},
			example: exampleTagRecord,
		},
		TagResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/Tag',
				},
			},
		},
		TagCreateResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/TagCreateResult',
				},
			},
		},
		TagListResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					type: 'array',
					items: {
						$ref: '#/components/schemas/Tag',
					},
				},
			},
			example: {
				ok: true,
				data: [exampleTagRecord],
			},
		},
		Metadata: {
			type: 'object',
			additionalProperties: true,
			description:
				'Arbitrary metadata object. Rewrite stores up to 20 keys with a combined maximum of 4kb.',
			example: exampleMetadata,
		},
		MessageAnalysis: {
			type: 'object',
			required: ['characters', 'encoding', 'segments'],
			additionalProperties: false,
			properties: {
				characters: {
					type: 'integer',
					description: 'Total character count in the rendered SMS content.',
					example: exampleMessageAnalysis.characters,
				},
				encoding: {
					type: 'string',
					enum: messageAnalysisEncoding,
					description: 'Encoding detected for the rendered SMS content.',
					example: exampleMessageAnalysis.encoding,
				},
				segments: {
					type: 'object',
					required: ['concat', 'count', 'reason', 'single'],
					additionalProperties: false,
					properties: {
						concat: {
							type: 'integer',
							description:
								'Maximum characters allowed per segment in multipart SMS.',
							example: exampleMessageAnalysis.segments.concat,
						},
						count: {
							type: 'integer',
							description:
								'Number of SMS segments required to send the message.',
							example: exampleMessageAnalysis.segments.count,
						},
						reason: {
							type: 'string',
							enum: messageAnalysisReasons,
							description:
								'Why Rewrite selected the reported segmentation result.',
							example: exampleMessageAnalysis.segments.reason,
						},
						single: {
							type: 'integer',
							description:
								'Maximum characters allowed when the message fits in a single SMS.',
							example: exampleMessageAnalysis.segments.single,
						},
					},
					example: exampleMessageAnalysis.segments,
				},
			},
			example: exampleMessageAnalysis,
		},
		MessageSegmentation: {
			type: 'object',
			required: ['max'],
			additionalProperties: false,
			properties: {
				max: {
					type: 'integer',
					minimum: 1,
					maximum: 24,
					description:
						'Maximum number of SMS segments Rewrite is allowed to send.',
					example: 2,
				},
				mode: {
					type: 'string',
					enum: ['fail', 'trim', 'send'],
					description:
						'How Rewrite should behave when the message exceeds the allowed segment count.',
					example: 'send',
				},
				smart: {
					type: 'boolean',
					description:
						'When `true`, Rewrite may optimize the content to fit GSM-7 when possible.',
					example: true,
				},
			},
			example: exampleMessageInlineBody.segmentation,
		},
		MessageInlineBody: {
			title: 'With content and direct number',
			type: 'object',
			required: ['to', 'content'],
			additionalProperties: false,
			properties: {
				to: {
					type: 'string',
					description: 'Destination number in E.164 format.',
					example: exampleMessageInlineBody.to,
				},
				content: {
					type: 'string',
					minLength: 1,
					maxLength: 1600,
					description: 'Rendered SMS content to send.',
					example: exampleMessageInlineBody.content,
				},
				tags: {
					$ref: '#/components/schemas/Metadata',
					description: 'Optional metadata stored with the message.',
					example: exampleMessageInlineBody.tags,
				},
				scheduledAt: {
					type: 'string',
					format: 'date-time',
					description:
						'When provided, Rewrite schedules the message for later delivery.',
					example: exampleMessageInlineBody.scheduledAt,
				},
				segmentation: {
					$ref: '#/components/schemas/MessageSegmentation',
					description: 'Optional segmentation rules for long SMS bodies.',
				},
			},
			example: exampleMessageInlineBody,
		},
		MessageInlineContactBody: {
			title: 'With content and saved contact',
			type: 'object',
			required: ['contact', 'content'],
			additionalProperties: false,
			properties: {
				contact: {
					type: 'string',
					minLength: 1,
					maxLength: 80,
					description:
						'Contact identifier or saved contact name resolved inside the current project.',
					example: exampleMessageInlineContactBody.contact,
				},
				content: {
					type: 'string',
					minLength: 1,
					maxLength: 1600,
					description: 'Rendered SMS content to send.',
					example: exampleMessageInlineContactBody.content,
				},
				tags: {
					$ref: '#/components/schemas/Metadata',
					description: 'Optional metadata stored with the message.',
					example: exampleMessageInlineContactBody.tags,
				},
				scheduledAt: {
					type: 'string',
					format: 'date-time',
					description:
						'When provided, Rewrite schedules the message for later delivery.',
				},
				segmentation: {
					$ref: '#/components/schemas/MessageSegmentation',
					description: 'Optional segmentation rules for long SMS bodies.',
				},
			},
			example: exampleMessageInlineContactBody,
		},
		MessageTemplateBody: {
			title: 'Using templates and direct number',
			type: 'object',
			required: ['to', 'templateId'],
			additionalProperties: false,
			properties: {
				to: {
					type: 'string',
					description: 'Destination number in E.164 format.',
					example: exampleMessageTemplateBody.to,
				},
				templateId: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Template identifier to render before sending.',
					example: exampleMessageTemplateBody.templateId,
				},
				variables: {
					type: 'object',
					additionalProperties: {
						type: 'string',
					},
					default: {},
					description:
						'Variable values used when rendering the selected template.',
					example: exampleMessageTemplateBody.variables,
				},
				tags: {
					$ref: '#/components/schemas/Metadata',
					description: 'Optional metadata stored with the message.',
					example: exampleMessageTemplateBody.tags,
				},
				scheduledAt: {
					type: 'string',
					format: 'date-time',
					description:
						'When provided, Rewrite schedules the message for later delivery.',
				},
				segmentation: {
					$ref: '#/components/schemas/MessageSegmentation',
					description:
						'Optional segmentation rules for the rendered template output.',
				},
			},
			example: exampleMessageTemplateBody,
		},
		MessageTemplateContactBody: {
			title: 'Using templates and saved contact',
			type: 'object',
			required: ['contact', 'templateId'],
			additionalProperties: false,
			properties: {
				contact: {
					type: 'string',
					minLength: 1,
					maxLength: 80,
					description:
						'Contact identifier or saved contact name resolved inside the current project.',
					example: exampleMessageTemplateContactBody.contact,
				},
				templateId: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Template identifier to render before sending.',
					example: exampleMessageTemplateContactBody.templateId,
				},
				variables: {
					type: 'object',
					additionalProperties: {
						type: 'string',
					},
					default: {},
					description:
						'Variable values used when rendering the selected template.',
					example: exampleMessageTemplateContactBody.variables,
				},
				tags: {
					$ref: '#/components/schemas/Metadata',
					description: 'Optional metadata stored with the message.',
					example: exampleMessageTemplateContactBody.tags,
				},
				scheduledAt: {
					type: 'string',
					format: 'date-time',
					description:
						'When provided, Rewrite schedules the message for later delivery.',
				},
				segmentation: {
					$ref: '#/components/schemas/MessageSegmentation',
					description:
						'Optional segmentation rules for the rendered template output.',
				},
			},
			example: exampleMessageTemplateContactBody,
		},
		MessageCreateBody: {
			oneOf: [
				{
					$ref: '#/components/schemas/MessageInlineBody',
				},
				{
					$ref: '#/components/schemas/MessageInlineContactBody',
				},
				{
					$ref: '#/components/schemas/MessageTemplateBody',
				},
				{
					$ref: '#/components/schemas/MessageTemplateContactBody',
				},
			],
		},
		MessageRef: {
			type: 'object',
			required: ['id', 'createdAt'],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Message identifier returned by Rewrite.',
					example: exampleMessageCreateResult.id,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when Rewrite accepted the message.',
					example: exampleMessageCreateResult.createdAt,
				},
			},
			example: {
				id: exampleMessageCreateResult.id,
				createdAt: exampleMessageCreateResult.createdAt,
			},
		},
		MessageCreateResult: {
			allOf: [
				{
					$ref: '#/components/schemas/MessageRef',
				},
				{
					type: 'object',
					required: ['analysis', 'sandbox'],
					additionalProperties: false,
					properties: {
						analysis: {
							$ref: '#/components/schemas/MessageAnalysis',
							description:
								'Segmentation analysis for the SMS content accepted by Rewrite.',
						},
						sandbox: {
							type: 'boolean',
							description:
								'Whether this message was created while the project was in sandbox mode.',
							example: exampleMessageCreateResult.sandbox,
						},
					},
				},
			],
			example: exampleMessageCreateResult,
		},
		MessageCreateResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/MessageCreateResult',
				},
			},
			example: {
				ok: true,
				data: exampleMessageCreateResult,
			},
		},
		MessageBatchCreateResult: {
			type: 'object',
			required: ['ids'],
			additionalProperties: false,
			properties: {
				ids: {
					type: 'array',
					description:
						'Identifiers for the messages accepted into the batch request.',
					items: {
						$ref: '#/components/schemas/Snowflake',
					},
					example: [
						exampleSnowflakes.message,
						exampleSnowflakes.messageNext,
						exampleSnowflakes.messageThird,
					],
				},
			},
			example: {
				ids: [
					exampleSnowflakes.message,
					exampleSnowflakes.messageNext,
					exampleSnowflakes.messageThird,
				],
			},
		},
		MessageBatchCreateResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/MessageBatchCreateResult',
				},
			},
			example: {
				ok: true,
				data: {
					ids: [
						exampleSnowflakes.message,
						exampleSnowflakes.messageNext,
						exampleSnowflakes.messageThird,
					],
				},
			},
		},
		Message: {
			type: 'object',
			required: [
				'id',
				'createdAt',
				'contact',
				'contactId',
				'to',
				'from',
				'type',
				'tags',
				'status',
				'country',
				'content',
				'encoding',
				'templateId',
				'deliveredAt',
				'scheduledAt',
				'sandbox',
			],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Message identifier returned by Rewrite.',
					example: exampleMessageRecord.id,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when Rewrite accepted the message.',
					example: exampleMessageRecord.createdAt,
				},
				contact: {
					type: ['string', 'null'],
					description:
						'Resolved contact label used for this message, when the request targeted a saved contact.',
					example: exampleMessageRecord.contact,
				},
				contactId: {
					type: ['string', 'null'],
					description:
						'Contact identifier associated with the message, when available.',
					example: exampleMessageRecord.contactId,
				},
				to: {
					type: 'string',
					description: 'Destination number in E.164 format.',
					example: exampleMessageRecord.to,
				},
				from: {
					type: ['string', 'null'],
					description:
						'Resolved sender ID used for this message, when available.',
					example: exampleMessageRecord.from,
				},
				type: {
					type: 'string',
					enum: messageTypes,
					description: 'Message type stored by Rewrite.',
					example: exampleMessageRecord.type,
				},
				tags: {
					$ref: '#/components/schemas/Metadata',
					description: 'Metadata attached to the message.',
					example: exampleMessageRecord.tags,
				},
				status: {
					type: 'string',
					enum: messageStatuses,
					description: 'Latest delivery status known by Rewrite.',
					example: exampleMessageRecord.status,
				},
				country: {
					type: 'string',
					description: 'Country inferred from the destination number.',
					example: exampleMessageRecord.country,
				},
				content: {
					type: 'string',
					description: 'Final SMS content sent to the destination number.',
					example: exampleMessageRecord.content,
				},
				encoding: {
					type: 'string',
					enum: messageEncoding,
					description: 'Encoding used by the provider when sending the SMS.',
					example: exampleMessageRecord.encoding,
				},
				templateId: {
					type: ['string', 'null'],
					description: 'Template used to render the message, when applicable.',
					example: exampleMessageRecord.templateId,
				},
				deliveredAt: {
					type: ['string', 'null'],
					format: 'date-time',
					description: 'Timestamp when the provider confirmed final delivery.',
					example: exampleMessageRecord.deliveredAt,
				},
				scheduledAt: {
					type: ['string', 'null'],
					format: 'date-time',
					description:
						'Scheduled send time, when the message was delayed intentionally.',
					example: exampleMessageRecord.scheduledAt,
				},
				sandbox: {
					type: 'boolean',
					description: 'Whether the message belongs to a sandbox project flow.',
					example: exampleMessageRecord.sandbox,
				},
			},
			example: exampleMessageRecord,
		},
		MessageResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/Message',
				},
			},
			example: {
				ok: true,
				data: exampleMessageRecord,
			},
		},
		MessageListResponse: {
			type: 'object',
			required: ['ok', 'data', 'cursor'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					type: 'array',
					items: {
						$ref: '#/components/schemas/Message',
					},
					example: [
						exampleMessageRecord,
						{
							...exampleMessageRecord,
							id: exampleSnowflakes.messageNext,
							to: '+5511888888888',
							status: 'SENT',
							deliveredAt: null,
						},
					],
				},
				cursor: {
					$ref: '#/components/schemas/Cursor',
				},
				count: {
					type: 'integer',
					description:
						'Only returned when `withCounts=true` is provided on the request.',
					example: 2,
				},
			},
			example: {
				ok: true,
				data: [
					exampleMessageRecord,
					{
						...exampleMessageRecord,
						id: exampleSnowflakes.messageNext,
						to: '+5511888888888',
						status: 'SENT',
						deliveredAt: null,
					},
				],
				cursor: exampleCursor,
			},
		},
		OTPPhoneCreateBody: {
			title: 'With direct number',
			type: 'object',
			required: ['to'],
			additionalProperties: false,
			properties: {
				to: {
					type: 'string',
					description: 'Destination number that should receive the OTP.',
					example: exampleOTPPhoneBody.to,
				},
				prefix: {
					type: 'string',
					minLength: 1,
					maxLength: 32,
					description: 'Short brand prefix included in the OTP SMS.',
					example: exampleOTPPhoneBody.prefix,
				},
				expiresIn: {
					type: 'integer',
					minimum: 1,
					maximum: 15,
					description: 'Minutes until the OTP expires.',
					example: exampleOTPPhoneBody.expiresIn,
				},
			},
			example: exampleOTPPhoneBody,
		},
		OTPContactCreateBody: {
			title: 'With saved contact',
			type: 'object',
			required: ['contact'],
			additionalProperties: false,
			properties: {
				contact: {
					type: 'string',
					minLength: 1,
					maxLength: 80,
					description:
						'Contact identifier or saved contact name resolved inside the current project.',
					example: exampleOTPContactBody.contact,
				},
				prefix: {
					type: 'string',
					minLength: 1,
					maxLength: 32,
					description: 'Short brand prefix included in the OTP SMS.',
					example: exampleOTPContactBody.prefix,
				},
				expiresIn: {
					type: 'integer',
					minimum: 1,
					maximum: 15,
					description: 'Minutes until the OTP expires.',
					example: exampleOTPContactBody.expiresIn,
				},
			},
			example: exampleOTPContactBody,
		},
		OTPCreateBody: {
			oneOf: [
				{
					$ref: '#/components/schemas/OTPPhoneCreateBody',
				},
				{
					$ref: '#/components/schemas/OTPContactCreateBody',
				},
			],
		},
		OTPCreateResult: {
			type: 'object',
			required: ['id', 'to', 'prefix', 'createdAt', 'expiresAt'],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					description: 'OTP identifier returned by Rewrite.',
					example: exampleSnowflakes.otp,
				},
				to: {
					type: 'string',
					description: 'Destination number used for the OTP.',
					example: '+5511999999999',
				},
				prefix: {
					type: 'string',
					description: 'Brand prefix included in the OTP SMS.',
					example: 'Rewrite',
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when Rewrite accepted the OTP request.',
					example: exampleTimestamps.createdAt,
				},
				expiresAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when the OTP becomes invalid.',
					example: exampleTimestamps.expiresAt,
				},
			},
			example: {
				id: exampleSnowflakes.otp,
				to: '+5511999999999',
				prefix: 'Rewrite',
				createdAt: exampleTimestamps.createdAt,
				expiresAt: exampleTimestamps.expiresAt,
			},
		},
		OTPCreateResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/OTPCreateResult',
				},
			},
		},
		OTPVerifyBody: {
			type: 'object',
			required: ['to', 'code'],
			additionalProperties: false,
			properties: {
				to: {
					type: 'string',
					description: 'Destination number used when the OTP was created.',
					example: '+5511999999999',
				},
				code: {
					type: 'string',
					minLength: 4,
					maxLength: 10,
					description: 'Numeric OTP code provided by the user.',
					example: '478201',
				},
			},
			example: {
				to: '+5511999999999',
				code: '478201',
			},
		},
		OTPVerifyResult: {
			type: 'object',
			required: ['id', 'valid', 'verifiedAt'],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					description: 'OTP identifier being verified.',
					example: exampleSnowflakes.otp,
				},
				valid: {
					type: 'boolean',
					const: true,
					description: 'Always `true` when the OTP verification succeeds.',
					example: true,
				},
				verifiedAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when Rewrite marked the OTP as verified.',
					example: exampleTimestamps.verifiedAt,
				},
			},
			example: {
				id: exampleSnowflakes.otp,
				valid: true,
				verifiedAt: exampleTimestamps.verifiedAt,
			},
		},
		OTPVerifyResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/OTPVerifyResult',
				},
			},
		},
		TemplateVariable: {
			type: 'object',
			required: ['name'],
			additionalProperties: false,
			properties: {
				name: {
					type: 'string',
					minLength: 1,
					maxLength: 32,
					description:
						'Variable placeholder name used inside the template content.',
					example: exampleTemplateVariable.name,
				},
				fallback: {
					type: 'string',
					minLength: 1,
					maxLength: 64,
					description:
						'Optional fallback value used when the variable is omitted at send time.',
					example: exampleTemplateVariable.fallback,
				},
			},
			example: exampleTemplateVariable,
		},
		TemplateI18n: {
			type: 'object',
			description:
				'Locale overrides keyed by lowercase ISO country code, for example `br`.',
			additionalProperties: {
				type: 'string',
				minLength: 1,
				maxLength: 1024,
			},
			example: exampleTemplateRecord.i18n,
		},
		TemplateCreateBody: {
			type: 'object',
			required: ['name', 'content', 'variables'],
			additionalProperties: false,
			properties: {
				name: {
					type: 'string',
					minLength: 1,
					maxLength: 32,
					description:
						'Template name used later in the dashboard and API responses.',
					example: exampleTemplateRecord.name,
				},
				content: {
					type: 'string',
					minLength: 1,
					maxLength: 1024,
					description:
						'Default SMS content rendered when no locale override applies.',
					example: exampleTemplateRecord.content,
				},
				variables: {
					type: 'array',
					maxItems: 15,
					description: 'Variables accepted by the template.',
					items: {
						$ref: '#/components/schemas/TemplateVariable',
					},
					example: exampleTemplateRecord.variables,
				},
				description: {
					type: ['string', 'null'],
					minLength: 1,
					maxLength: 72,
					description:
						'Short human-readable explanation of what the template is for.',
					example: exampleTemplateRecord.description,
				},
				tags: {
					$ref: '#/components/schemas/Metadata',
					description: 'Optional metadata stored with the template.',
					example: exampleTemplateRecord.tags,
				},
			},
			example: {
				name: exampleTemplateRecord.name,
				content: exampleTemplateRecord.content,
				variables: exampleTemplateRecord.variables,
				description: exampleTemplateRecord.description,
				tags: exampleTemplateRecord.tags,
			},
		},
		TemplateUpdateBody: {
			type: 'object',
			additionalProperties: false,
			properties: {
				content: {
					type: 'string',
					minLength: 1,
					maxLength: 1024,
					description: 'Updated default SMS content.',
					example: exampleTemplateRecord.content,
				},
				variables: {
					type: 'array',
					maxItems: 15,
					description: 'Updated variable definitions for the template.',
					items: {
						$ref: '#/components/schemas/TemplateVariable',
					},
					example: exampleTemplateRecord.variables,
				},
				description: {
					type: ['string', 'null'],
					minLength: 1,
					maxLength: 72,
					description: 'Updated human-readable description for the template.',
					example: 'Template usado no fluxo de recuperacao de conta',
				},
				tags: {
					$ref: '#/components/schemas/Metadata',
					description: 'Replacement metadata stored with the template.',
					example: exampleTemplateRecord.tags,
				},
			},
			example: {
				description: 'Template usado no fluxo de recuperacao de conta',
			},
		},
		Template: {
			type: 'object',
			required: [
				'id',
				'name',
				'content',
				'variables',
				'description',
				'createdAt',
			],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Template identifier returned by Rewrite.',
					example: exampleTemplateRecord.id,
				},
				name: {
					type: 'string',
					description: 'Template name.',
					example: exampleTemplateRecord.name,
				},
				content: {
					type: 'string',
					description: 'Default SMS content stored for the template.',
					example: exampleTemplateRecord.content,
				},
				i18n: {
					$ref: '#/components/schemas/TemplateI18n',
					description: 'Locale-specific overrides available for the template.',
				},
				variables: {
					type: 'array',
					description: 'Variable definitions accepted by the template.',
					items: {
						$ref: '#/components/schemas/TemplateVariable',
					},
					example: exampleTemplateRecord.variables,
				},
				description: {
					type: ['string', 'null'],
					description: 'Human-readable description saved with the template.',
					example: exampleTemplateRecord.description,
				},
				tags: {
					$ref: '#/components/schemas/Metadata',
					description: 'Metadata stored with the template.',
					example: exampleTemplateRecord.tags,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when the template was created.',
					example: exampleTemplateRecord.createdAt,
				},
			},
			example: exampleTemplateRecord,
		},
		TemplateResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/Template',
				},
			},
		},
		TemplateListResponse: {
			type: 'object',
			required: ['ok', 'data', 'cursor'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					type: 'array',
					items: {
						$ref: '#/components/schemas/Template',
					},
				},
				cursor: {
					$ref: '#/components/schemas/Cursor',
				},
			},
		},
		TemplateCreateResult: {
			type: 'object',
			required: ['id', 'createdAt'],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Template identifier returned by Rewrite.',
					example: exampleTemplateRecord.id,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when the template was created.',
					example: exampleTemplateRecord.createdAt,
				},
			},
			example: {
				id: exampleTemplateRecord.id,
				createdAt: exampleTemplateRecord.createdAt,
			},
		},
		TemplateCreateResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/TemplateCreateResult',
				},
			},
		},
		WebhookDeliveryConfig: {
			type: 'object',
			additionalProperties: false,
			properties: {
				timeout: {
					type: 'integer',
					minimum: 1000,
					maximum: 5000,
					description:
						'Maximum time in milliseconds Rewrite waits for each delivery attempt before timing out.',
					example: exampleWebhookRecord.timeout,
				},
				retries: {
					type: 'integer',
					minimum: 0,
					maximum: 5,
					description:
						'Number of retry attempts Rewrite schedules after the first failed delivery.',
					example: exampleWebhookRecord.retries,
				},
			},
			example: {
				timeout: exampleWebhookRecord.timeout,
				retries: exampleWebhookRecord.retries,
			},
		},
		WebhookCreateBody: {
			type: 'object',
			required: ['events', 'endpoint'],
			additionalProperties: false,
			properties: {
				name: {
					type: 'string',
					minLength: 1,
					maxLength: 32,
					description: 'Friendly name shown in the dashboard and logs.',
					example: exampleWebhookRecord.name,
				},
				events: {
					type: 'array',
					minItems: 1,
					uniqueItems: true,
					description: 'Event types that should be delivered to this webhook.',
					items: {
						type: 'string',
						enum: webhookEventTypes,
					},
					example: exampleWebhookRecord.events,
				},
				secret: {
					type: 'string',
					minLength: 16,
					maxLength: 128,
					description:
						'Accepted formats: `whsec_<base64>`, raw base64, or legacy `rw_whsec_...`.',
					example: 'whsec_dGVzdF9zZWNyZXRfdmFsdWU=',
				},
				endpoint: {
					type: 'string',
					format: 'uri',
					maxLength: 255,
					description:
						'Must be HTTPS in production. `http://localhost/...` is also accepted. Query strings and fragments are rejected.',
					example: exampleWebhookRecord.endpoint,
				},
				delivery: {
					$ref: '#/components/schemas/WebhookDeliveryConfig',
					description:
						'Optional delivery tuning for timeout and retry behavior.',
				},
			},
			example: {
				name: exampleWebhookRecord.name,
				events: exampleWebhookRecord.events,
				secret: 'whsec_dGVzdF9zZWNyZXRfdmFsdWU=',
				endpoint: exampleWebhookRecord.endpoint,
				delivery: {
					timeout: exampleWebhookRecord.timeout,
					retries: exampleWebhookRecord.retries,
				},
			},
		},
		WebhookUpdateBody: {
			type: 'object',
			additionalProperties: false,
			properties: {
				name: {
					type: ['string', 'null'],
					minLength: 1,
					maxLength: 32,
					description:
						'Updated friendly name. Send `null` to remove the current name.',
					example: 'delivery-events-staging',
				},
				events: {
					type: 'array',
					minItems: 1,
					uniqueItems: true,
					description: 'Updated event selection for the webhook.',
					items: {
						type: 'string',
						enum: webhookEventTypes,
					},
					example: ['message.sent', 'message.failed'],
				},
				secret: {
					type: 'string',
					minLength: 16,
					maxLength: 128,
					description: 'New signing secret to use for future deliveries.',
					example: 'whsec_bmV3X3NlY3JldF92YWx1ZQ==',
				},
				endpoint: {
					type: 'string',
					format: 'uri',
					maxLength: 255,
					description: 'Updated destination URL for future deliveries.',
					example: 'https://example.com/rewrite/webhooks/secondary',
				},
				isEnabled: {
					type: 'boolean',
					description:
						'Whether Rewrite should actively deliver events to this webhook.',
					example: false,
				},
				delivery: {
					$ref: '#/components/schemas/WebhookDeliveryConfig',
					description:
						'Updated delivery tuning for timeout and retry behavior.',
				},
			},
			example: {
				isEnabled: false,
				delivery: {
					timeout: 2000,
					retries: 1,
				},
			},
		},
		Webhook: {
			type: 'object',
			required: [
				'id',
				'name',
				'events',
				'isEnabled',
				'sandbox',
				'endpoint',
				'retries',
				'timeout',
				'lastDeliveryAt',
				'createdAt',
			],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Webhook identifier returned by Rewrite.',
					example: exampleWebhookRecord.id,
				},
				name: {
					type: ['string', 'null'],
					description: 'Friendly name shown in the dashboard and logs.',
					example: exampleWebhookRecord.name,
				},
				events: {
					type: 'array',
					description: 'Events delivered to this webhook.',
					items: {
						type: 'string',
						enum: webhookEventTypes,
					},
					example: exampleWebhookRecord.events,
				},
				isEnabled: {
					type: 'boolean',
					description:
						'Whether Rewrite currently delivers events to this webhook.',
					example: exampleWebhookRecord.isEnabled,
				},
				sandbox: {
					type: 'boolean',
					description: 'Whether the webhook belongs to a sandbox project.',
					example: exampleWebhookRecord.sandbox,
				},
				endpoint: {
					type: 'string',
					description: 'Destination URL that receives Rewrite webhook events.',
					example: exampleWebhookRecord.endpoint,
				},
				retries: {
					type: 'integer',
					description:
						'Number of retry attempts Rewrite schedules after the first failed delivery.',
					example: exampleWebhookRecord.retries,
				},
				timeout: {
					type: 'integer',
					description:
						'Maximum time in milliseconds Rewrite waits for each delivery attempt before timing out.',
					example: exampleWebhookRecord.timeout,
				},
				lastDeliveryAt: {
					type: ['string', 'null'],
					format: 'date-time',
					description:
						'Timestamp of the last recorded delivery attempt for this webhook.',
					example: exampleWebhookRecord.lastDeliveryAt,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when the webhook was created.',
					example: exampleWebhookRecord.createdAt,
				},
			},
			example: exampleWebhookRecord,
		},
		WebhookWithSecret: {
			allOf: [
				{
					$ref: '#/components/schemas/Webhook',
				},
				{
					type: 'object',
					required: ['secret'],
					additionalProperties: false,
					properties: {
						secret: {
							type: 'string',
							description: 'Signing secret associated with the webhook.',
							example: 'whsec_dGVzdF9zZWNyZXRfdmFsdWU=',
						},
					},
				},
			],
			example: {
				...exampleWebhookRecord,
				secret: 'whsec_dGVzdF9zZWNyZXRfdmFsdWU=',
			},
		},
		WebhookListResponse: {
			type: 'object',
			required: ['ok', 'data', 'cursor'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					type: 'array',
					items: {
						$ref: '#/components/schemas/Webhook',
					},
				},
				cursor: {
					$ref: '#/components/schemas/Cursor',
				},
			},
		},
		WebhookResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/WebhookWithSecret',
				},
			},
		},
		WebhookCreateResult: {
			type: 'object',
			required: ['id', 'secret', 'createdAt'],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Webhook identifier returned by Rewrite.',
					example: exampleWebhookRecord.id,
				},
				secret: {
					type: 'string',
					description: 'Generated signing secret to persist on your side.',
					example: 'whsec_dGVzdF9zZWNyZXRfdmFsdWU=',
				},
				sandbox: {
					type: 'boolean',
					description: 'Whether the webhook was created under sandbox mode.',
					example: false,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when the webhook was created.',
					example: exampleWebhookRecord.createdAt,
				},
			},
			example: {
				id: exampleWebhookRecord.id,
				secret: 'whsec_dGVzdF9zZWNyZXRfdmFsdWU=',
				sandbox: false,
				createdAt: exampleWebhookRecord.createdAt,
			},
		},
		WebhookCreateResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/WebhookCreateResult',
				},
			},
		},
		WebhookOTPMetadata: {
			type: 'object',
			required: ['prefix', 'expiresIn', 'expiresAt'],
			additionalProperties: false,
			properties: {
				prefix: {
					type: 'string',
					description: 'Brand prefix embedded in the OTP SMS.',
					example: 'Rewrite',
				},
				expiresIn: {
					type: 'integer',
					description: 'Minutes until the OTP expires.',
					example: 5,
				},
				expiresAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when the OTP becomes invalid.',
					example: exampleTimestamps.expiresAt,
				},
			},
			example: {
				prefix: 'Rewrite',
				expiresIn: 5,
				expiresAt: exampleTimestamps.expiresAt,
			},
		},
		WebhookMessageData: {
			type: 'object',
			required: [
				'id',
				'projectId',
				'contact',
				'contactId',
				'to',
				'tags',
				'sandbox',
				'type',
				'status',
				'content',
				'country',
				'analysis',
				'error',
				'deliveredAt',
				'scheduledAt',
				'templateId',
			],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Message identifier that triggered the webhook.',
					example: exampleSnowflakes.message,
				},
				projectId: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Project identifier associated with the event.',
					example: exampleSnowflakes.project,
				},
				contact: {
					type: ['string', 'null'],
					description:
						'Resolved contact label used to create the message, when available.',
					example: exampleWebhookEvent.data.contact,
				},
				contactId: {
					type: ['string', 'null'],
					description:
						'Contact identifier associated with the message, when available.',
					example: exampleWebhookEvent.data.contactId,
				},
				to: {
					type: 'string',
					description: 'Destination number for the message.',
					example: '+5511999999999',
				},
				tags: {
					$ref: '#/components/schemas/Metadata',
					description: 'Metadata attached to the message.',
					example: exampleMetadata,
				},
				sandbox: {
					type: 'boolean',
					description: 'Whether the message belongs to a sandbox flow.',
					example: false,
				},
				type: {
					type: 'string',
					enum: messageTypes,
					description: 'Message type associated with the event.',
					example: 'SMS',
				},
				status: {
					type: 'string',
					enum: messageStatuses,
					description: 'Delivery status reported in the event.',
					example: 'DELIVERED',
				},
				content: {
					type: 'string',
					description: 'Rendered SMS content included in the event payload.',
					example: 'Rewrite: seu codigo e 478201',
				},
				country: {
					type: 'string',
					description: 'Country inferred from the destination number.',
					example: 'br',
				},
				analysis: {
					$ref: '#/components/schemas/MessageAnalysis',
					description: 'Segmentation analysis for the message content.',
				},
				error: {
					type: ['object', 'null'],
					additionalProperties: false,
					required: ['code', 'message'],
					properties: {
						code: {
							type: ['string', 'number', 'null'],
							description:
								'Provider or internal code associated with the delivery failure.',
							example: null,
						},
						message: {
							type: 'string',
							description: 'Human-readable explanation for the failure.',
							example: 'Provider timeout',
						},
					},
					example: null,
				},
				deliveredAt: {
					type: ['string', 'null'],
					format: 'date-time',
					description: 'Timestamp when the provider confirmed delivery.',
					example: exampleTimestamps.deliveredAt,
				},
				scheduledAt: {
					type: ['string', 'null'],
					format: 'date-time',
					description: 'Scheduled send time, when applicable.',
					example: null,
				},
				templateId: {
					type: ['string', 'null'],
					description:
						'Template identifier used to render the message, when applicable.',
					example: null,
				},
				otp: {
					$ref: '#/components/schemas/WebhookOTPMetadata',
					description: 'OTP metadata present only for `sms.otp` events.',
				},
			},
			example: exampleWebhookEvent.data,
		},
		WebhookBatchData: {
			type: 'object',
			required: ['id', 'ids', 'projectId'],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Batch identifier returned by Rewrite.',
					example: exampleSnowflakes.messageThird,
				},
				projectId: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Project identifier associated with the batch event.',
					example: exampleSnowflakes.project,
				},
				ids: {
					type: 'array',
					description: 'Accepted message identifiers that belong to the batch.',
					items: {
						$ref: '#/components/schemas/Snowflake',
					},
					example: [
						exampleSnowflakes.message,
						exampleSnowflakes.messageNext,
						exampleSnowflakes.messageThird,
					],
				},
			},
			example: {
				id: exampleSnowflakes.messageThird,
				projectId: exampleSnowflakes.project,
				ids: [
					exampleSnowflakes.message,
					exampleSnowflakes.messageNext,
					exampleSnowflakes.messageThird,
				],
			},
		},
		WebhookEvent: {
			type: 'object',
			required: ['id', 'createdAt', 'type', 'sandbox', 'data'],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Webhook event identifier generated by Rewrite.',
					example: exampleWebhookEvent.id,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when Rewrite created the event payload.',
					example: exampleWebhookEvent.createdAt,
				},
				type: {
					type: 'string',
					enum: webhookEventTypes,
					description: 'Webhook event type.',
					example: exampleWebhookEvent.type,
				},
				sandbox: {
					type: 'boolean',
					description:
						'Whether Rewrite created this event while the project was in sandbox mode.',
					example: exampleWebhookEvent.sandbox,
				},
				data: {
					oneOf: [
						{
							$ref: '#/components/schemas/WebhookMessageData',
						},
						{
							$ref: '#/components/schemas/WebhookBatchData',
						},
					],
					description: 'Event payload for either a single message or a batch.',
				},
			},
			example: exampleWebhookEvent,
		},
		DeliverySummary: {
			type: 'object',
			required: [
				'id',
				'url',
				'type',
				'code',
				'error',
				'status',
				'attempt',
				'latency',
				'retryAt',
				'createdAt',
				'messageId',
				'sandbox',
			],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Webhook delivery log identifier.',
					example: exampleDeliverySummary.id,
				},
				url: {
					type: 'string',
					description: 'Webhook URL that received the delivery attempt.',
					example: exampleDeliverySummary.url,
				},
				type: {
					type: 'string',
					enum: webhookEventTypes,
					description: 'Webhook event type delivered in this attempt.',
					example: exampleDeliverySummary.type,
				},
				code: {
					type: ['integer', 'null'],
					description: 'HTTP status code returned by the webhook URL.',
					example: exampleDeliverySummary.code,
				},
				error: {
					type: ['string', 'null'],
					description:
						'Transport or application error captured for the attempt.',
					example: exampleDeliverySummary.error,
				},
				status: {
					type: 'string',
					enum: webhookDeliveryStatuses,
					description: 'Delivery outcome recorded by Rewrite.',
					example: exampleDeliverySummary.status,
				},
				attempt: {
					type: 'integer',
					description: 'Attempt number for this delivery.',
					example: exampleDeliverySummary.attempt,
				},
				latency: {
					type: ['integer', 'null'],
					description: 'Round-trip time in milliseconds.',
					example: exampleDeliverySummary.latency,
				},
				retryAt: {
					type: ['string', 'null'],
					format: 'date-time',
					description:
						'Next scheduled retry time, when the attempt failed and will retry.',
					example: exampleDeliverySummary.retryAt,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when Rewrite recorded the delivery attempt.',
					example: exampleDeliverySummary.createdAt,
				},
				messageId: {
					type: ['string', 'null'],
					description:
						'Message identifier associated with the delivery attempt, when available.',
					example: exampleDeliverySummary.messageId,
				},
				sandbox: {
					type: 'boolean',
					description: 'Whether the delivery belongs to a sandbox flow.',
					example: exampleDeliverySummary.sandbox,
				},
			},
			example: exampleDeliverySummary,
		},
		DeliveryDetail: {
			allOf: [
				{
					$ref: '#/components/schemas/DeliverySummary',
				},
				{
					type: 'object',
					required: ['payload', 'webhookId'],
					additionalProperties: false,
					properties: {
						payload: {
							$ref: '#/components/schemas/WebhookEvent',
							description: 'Event payload delivered during this attempt.',
						},
						webhookId: {
							type: ['string', 'null'],
							description: 'Webhook identifier associated with the log entry.',
							example: exampleDeliveryDetail.webhookId,
						},
					},
				},
			],
			example: exampleDeliveryDetail,
		},
		DeliveryListResponse: {
			type: 'object',
			required: ['ok', 'data', 'cursor'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					type: 'array',
					items: {
						$ref: '#/components/schemas/DeliverySummary',
					},
				},
				cursor: {
					$ref: '#/components/schemas/Cursor',
				},
			},
			example: {
				ok: true,
				data: [
					exampleDeliverySummary,
					{
						...exampleDeliverySummary,
						id: exampleSnowflakes.logNext,
						createdAt: exampleTimestamps.deliveredAt,
					},
				],
				cursor: {
					persist: false,
				},
			},
		},
		DeliveryResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/DeliveryDetail',
				},
			},
		},
		CompactDelivery: {
			type: 'object',
			required: [
				'id',
				'url',
				'code',
				'webhookId',
				'messageId',
				'sandbox',
				'createdAt',
			],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					example: exampleCompactDelivery.id,
				},
				url: {
					type: 'string',
					example: exampleCompactDelivery.url,
				},
				code: {
					type: ['integer', 'null'],
					example: exampleCompactDelivery.code,
				},
				webhookId: {
					type: ['string', 'null'],
					example: exampleCompactDelivery.webhookId,
				},
				messageId: {
					type: ['string', 'null'],
					example: exampleCompactDelivery.messageId,
				},
				sandbox: {
					type: 'boolean',
					example: exampleCompactDelivery.sandbox,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					example: exampleCompactDelivery.createdAt,
				},
			},
			example: exampleCompactDelivery,
		},
		CompactDeliveryListResponse: {
			type: 'object',
			required: ['ok', 'data', 'cursor'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					type: 'array',
					items: {
						$ref: '#/components/schemas/CompactDelivery',
					},
				},
				cursor: {
					$ref: '#/components/schemas/Cursor',
				},
			},
			example: {
				ok: true,
				data: [exampleCompactDelivery],
				cursor: {
					persist: false,
				},
			},
		},
		RequestLogSummary: {
			type: 'object',
			required: [
				'id',
				'method',
				'endpoint',
				'status',
				'source',
				'sandbox',
				'createdAt',
			],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					example: exampleRequestLogSummary.id,
				},
				method: {
					type: 'string',
					example: exampleRequestLogSummary.method,
				},
				endpoint: {
					type: 'string',
					example: exampleRequestLogSummary.endpoint,
				},
				status: {
					type: 'integer',
					minimum: 100,
					maximum: 600,
					example: exampleRequestLogSummary.status,
				},
				source: {
					type: 'string',
					enum: ['API', 'Dashboard'],
					example: exampleRequestLogSummary.source,
				},
				sandbox: {
					type: 'boolean',
					example: exampleRequestLogSummary.sandbox,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					example: exampleRequestLogSummary.createdAt,
				},
			},
			example: exampleRequestLogSummary,
		},
		RequestLogDetail: {
			allOf: [
				{
					$ref: '#/components/schemas/RequestLogSummary',
				},
				{
					type: 'object',
					required: [
						'ip',
						'projectId',
						'apiKeyId',
						'requestBody',
						'responseBody',
					],
					additionalProperties: false,
					properties: {
						ip: {
							type: ['string', 'null'],
							example: exampleRequestLogDetail.ip,
						},
						projectId: {
							type: ['string', 'null'],
							example: exampleRequestLogDetail.projectId,
						},
						apiKeyId: {
							type: ['string', 'null'],
							example: exampleRequestLogDetail.apiKeyId,
						},
						requestBody: {
							type: ['object', 'array', 'string', 'number', 'boolean', 'null'],
							example: exampleRequestLogDetail.requestBody,
						},
						responseBody: {
							type: ['object', 'array', 'string', 'number', 'boolean', 'null'],
							example: exampleRequestLogDetail.responseBody,
						},
					},
				},
			],
			example: exampleRequestLogDetail,
		},
		RequestLogListResponse: {
			type: 'object',
			required: ['ok', 'data', 'cursor'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					type: 'array',
					items: {
						$ref: '#/components/schemas/RequestLogSummary',
					},
				},
				cursor: {
					$ref: '#/components/schemas/Cursor',
				},
			},
			example: {
				ok: true,
				data: [exampleRequestLogSummary],
				cursor: {
					persist: false,
				},
			},
		},
		RequestLogResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/RequestLogDetail',
				},
			},
		},
	},
};

const stripCompositeExamples = (value) => {
	if (!value || typeof value !== 'object') return;

	if (Array.isArray(value)) {
		for (const item of value) stripCompositeExamples(item);
		return;
	}

	if (
		value.type === 'object' ||
		Array.isArray(value.allOf) ||
		Array.isArray(value.oneOf) ||
		Array.isArray(value.anyOf)
	) {
		delete value.example;
	}

	for (const child of Object.values(value)) {
		stripCompositeExamples(child);
	}
};

stripCompositeExamples(baseComponents.schemas);

const okResponse = ({
	schemaRef,
	description = 'Successful response',
	example,
}) => ({
	200: {
		description,
		content: {
			'application/json': {
				schema: {
					$ref: schemaRef,
				},
				...(example
					? {
							examples: {
								success: {
									summary: 'Success',
									value: example,
								},
							},
						}
					: {}),
			},
		},
	},
});

const jsonBody = ({ schema, example, examples }) => ({
	required: true,
	content: {
		'application/json': {
			schema,
			...(example ? { example } : {}),
			...(examples ? { examples } : {}),
		},
	},
});

const sdkSource = (snippet) =>
	[
		"import { Rewrite } from '@rewritetoday/sdk';",
		'',
		'const rewrite = new Rewrite(process.env.REWRITE_API_KEY!);',
		'',
		snippet.trim(),
	].join('\n');

const codeSamples = (snippet) => [
	{
		lang: 'typescript',
		label: 'Node.js',
		source: sdkSource(snippet),
	},
];

const operationDescription = ({ details }) => details.trim();

const tags = {
	messages: {
		name: 'Messages',
		description: 'Send, read and manage SMS messages.',
	},
	otp: {
		name: 'OTP',
		description: 'Send and verify one-time-password codes.',
	},
	templates: {
		name: 'Templates',
		description: 'Reusable SMS templates and related maintenance actions.',
	},
	webhooks: {
		name: 'Webhooks',
		description: 'Create and manage webhooks for Rewrite events.',
	},
	logs: {
		name: 'Logs',
		description: 'Inspect API request logs recorded for the current project.',
	},
	deliveries: {
		name: 'Deliveries',
		description: 'Inspect webhook delivery attempts and their payloads.',
	},
	apiKeys: {
		name: 'API Keys',
		description: 'Create, inspect and manage project API keys.',
	},
	contacts: {
		name: 'Contacts',
		description: 'Store reusable recipients and their metadata.',
	},
	segments: {
		name: 'Segments',
		description: 'Group contacts and manage segment membership.',
	},
	tagResources: {
		name: 'Tags',
		description: 'Create and manage reusable contact tags.',
	},
};

const messagesPaths = {
	'/messages': {
		post: {
			tags: [tags.messages.name],
			operationId: 'createMessage',
			summary: 'Send a message',
			description: operationDescription({
				details:
					'Send one SMS with inline content or by rendering a saved template. You can target either a direct E.164 number in `to` or a saved project contact in `contact`. Projects with international numbers enabled can send beyond the default `+55` traffic profile.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.messages.send({
  to: '+5511999999999',
  content: 'Rewrite: seu codigo e 478201',
  tags: { flow: 'login', origin: 'checkout' },
});

if (error) throw error;`),
			security: securityRequirement('message:write'),
			parameters: [{ $ref: '#/components/parameters/IdempotencyKey' }],
			requestBody: jsonBody({
				schema: {
					$ref: '#/components/schemas/MessageCreateBody',
				},
				examples: {
					withContent: {
						summary: 'With content',
						value: exampleMessageInlineBody,
					},
					withSavedContact: {
						summary: 'With saved contact',
						value: exampleMessageInlineContactBody,
					},
					usingTemplate: {
						summary: 'Using templates',
						value: exampleMessageTemplateBody,
					},
					usingTemplateAndContact: {
						summary: 'Using template and saved contact',
						value: exampleMessageTemplateContactBody,
					},
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/MessageCreateResponse',
				example: {
					ok: true,
					data: exampleMessageCreateResult,
				},
			}),
			'x-required-scopes': ['message:write'],
		},
		get: {
			tags: [tags.messages.name],
			operationId: 'listMessages',
			summary: 'List messages',
			description: operationDescription({
				details:
					'List accepted messages for the current project. Results are returned in reverse chronological order with a top-level cursor for pagination.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error, cursor } = await rewrite.messages.list({
  limit: 25,
  status: 'DELIVERED',
});

if (error) throw error;`),
			security: securityRequirement('message:read'),
			parameters: [
				{ $ref: '#/components/parameters/After' },
				{ $ref: '#/components/parameters/Before' },
				{ $ref: '#/components/parameters/Limit' },
				{ $ref: '#/components/parameters/MessageStatus' },
				{ $ref: '#/components/parameters/CountryCode' },
				{ $ref: '#/components/parameters/MessageEncoding' },
				{ $ref: '#/components/parameters/MessageScheduled' },
				{ $ref: '#/components/parameters/MessageWithCounts' },
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/MessageListResponse',
				example: {
					ok: true,
					data: [
						exampleMessageRecord,
						{
							...exampleMessageRecord,
							id: exampleSnowflakes.messageNext,
							to: '+5511888888888',
							status: 'SENT',
							deliveredAt: null,
						},
					],
					count: 2,
					cursor: exampleCursor,
				},
			}),
			'x-required-scopes': ['message:read'],
		},
	},
	'/messages/batch': {
		post: {
			tags: [tags.messages.name],
			operationId: 'createMessageBatch',
			summary: 'Send batch messages',
			description: operationDescription({
				details:
					'Send between 1 and 100 SMS messages in one request. Each entry can target either a direct E.164 number or a saved project contact, and Rewrite returns only the accepted message IDs.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.messages.batch(
  [
    {
      to: '+5511999999999',
      content: 'Rewrite: seu codigo e 478201',
    },
    {
      to: '+5511888888888',
      templateId: '${exampleSnowflakes.template}',
      variables: { code: '941205' },
    },
  ],
  {
    idempotencyKey: 'msg:batch:login-otp:2026-03-20T14:22',
  },
);

if (error) throw error;`),
			security: securityRequirement('message:write'),
			parameters: [{ $ref: '#/components/parameters/IdempotencyKey' }],
			requestBody: jsonBody({
				schema: {
					type: 'array',
					minItems: 1,
					maxItems: 100,
					items: {
						$ref: '#/components/schemas/MessageCreateBody',
					},
				},
				example: [
					{
						to: '+5511999999999',
						content: 'Rewrite: seu codigo e 478201',
					},
					{
						contact: 'Fernanda',
						content: 'Rewrite: seu codigo e 478201',
					},
					{
						to: '+5511888888888',
						templateId: exampleSnowflakes.template,
						variables: {
							code: '941205',
						},
					},
					{
						contact: exampleSnowflakes.contact,
						templateId: exampleSnowflakes.template,
						variables: {
							code: '941205',
						},
					},
				],
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/MessageBatchCreateResponse',
				example: {
					ok: true,
					data: {
						ids: [
							exampleSnowflakes.message,
							exampleSnowflakes.messageNext,
							exampleSnowflakes.messageThird,
						],
					},
				},
			}),
			'x-required-scopes': ['message:write'],
		},
	},
	'/messages/{id}/cancel': {
		post: {
			tags: [tags.messages.name],
			operationId: 'cancelMessage',
			summary: 'Cancel a message',
			description: operationDescription({
				details:
					'Cancel a queued or scheduled message before it reaches the provider.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.messages.cancel(
  '${exampleSnowflakes.message}',
);

if (error) throw error;`),
			security: securityRequirement('message:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Message identifier to cancel.',
					schema: {
						$ref: '#/components/schemas/Snowflake',
					},
					example: exampleSnowflakes.message,
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: {
					ok: true,
					data: null,
				},
			}),
			'x-required-scopes': ['message:write'],
		},
	},
	'/messages/{id}': {
		get: {
			tags: [tags.messages.name],
			operationId: 'getMessage',
			summary: 'Get a message',
			description: operationDescription({
				details:
					'Fetch the current state of a single message, including delivery timestamps and rendered content.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.messages.get(
  '${exampleSnowflakes.message}',
);

if (error) throw error;`),
			security: securityRequirement('message:read'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Message identifier returned by Rewrite.',
					schema: {
						$ref: '#/components/schemas/Snowflake',
					},
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/MessageResponse',
				example: {
					ok: true,
					data: exampleMessageRecord,
				},
			}),
			'x-required-scopes': ['message:read'],
		},
	},
	'/otp': {
		post: {
			tags: [tags.otp.name],
			operationId: 'createOtp',
			summary: 'Send an OTP code',
			description: operationDescription({
				details:
					'Create and send an OTP SMS to either a direct destination number or a saved project contact. Projects with international numbers enabled can send beyond the default `+55` traffic profile.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.otp.send({
  to: '+5511999999999',
  prefix: 'Rewrite',
  expiresIn: 5,
  idempotencyKey: 'otp:login:2026-03-20T14:22',
});

if (error) throw error;`),
			security: securityRequirement('message:write'),
			parameters: [{ $ref: '#/components/parameters/IdempotencyKey' }],
			requestBody: jsonBody({
				schema: {
					$ref: '#/components/schemas/OTPCreateBody',
				},
				examples: {
					withDirectNumber: {
						summary: 'With direct number',
						value: exampleOTPPhoneBody,
					},
					withSavedContact: {
						summary: 'With saved contact',
						value: exampleOTPContactBody,
					},
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OTPCreateResponse',
				example: {
					ok: true,
					data: {
						id: exampleSnowflakes.otp,
						to: '+5511999999999',
						prefix: 'Rewrite',
						createdAt: exampleTimestamps.createdAt,
						expiresAt: exampleTimestamps.expiresAt,
					},
				},
			}),
			'x-required-scopes': ['message:write'],
		},
	},
	'/otp/{id}/verify': {
		post: {
			tags: [tags.otp.name],
			operationId: 'verifyOtp',
			summary: 'Verify an OTP code',
			description: operationDescription({
				details:
					'Validate the OTP code previously sent by Rewrite and close the verification flow.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.otp.verify({
  id: '${exampleSnowflakes.otp}',
  to: '+5511999999999',
  code: '478201',
});

if (error) throw error;`),
			security: securityRequirement('message:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'OTP identifier returned by Rewrite.',
					schema: {
						$ref: '#/components/schemas/Snowflake',
					},
				},
			],
			requestBody: jsonBody({
				schema: {
					$ref: '#/components/schemas/OTPVerifyBody',
				},
				example: {
					to: '+5511999999999',
					code: '478201',
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OTPVerifyResponse',
				example: {
					ok: true,
					data: {
						id: exampleSnowflakes.otp,
						valid: true,
						verifiedAt: exampleTimestamps.verifiedAt,
					},
				},
			}),
			'x-required-scopes': ['message:write'],
		},
	},
};

const messagesOnlyPaths = {
	'/messages': messagesPaths['/messages'],
	'/messages/batch': messagesPaths['/messages/batch'],
	'/messages/{id}/cancel': messagesPaths['/messages/{id}/cancel'],
	'/messages/{id}': messagesPaths['/messages/{id}'],
};

const otpPaths = {
	'/otp': messagesPaths['/otp'],
	'/otp/{id}/verify': messagesPaths['/otp/{id}/verify'],
};

const apiKeysPaths = {
	'/api-keys': {
		get: {
			tags: [tags.apiKeys.name],
			operationId: 'listApiKeys',
			summary: 'List API keys',
			description: operationDescription({
				details:
					'List API keys created for the current project. Results are paginated with a top-level cursor.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error, cursor } = await rewrite.apiKeys.list({
  limit: 20,
});

if (error) throw error;`),
			security: securityRequirement('project:api_keys:read'),
			parameters: [
				{ $ref: '#/components/parameters/After' },
				{ $ref: '#/components/parameters/Before' },
				{ $ref: '#/components/parameters/Limit' },
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/APIKeyListResponse',
				example: {
					ok: true,
					data: [exampleAPIKeyRecord],
					cursor: { persist: false },
				},
			}),
			'x-required-scopes': ['project:api_keys:read'],
		},
		post: {
			tags: [tags.apiKeys.name],
			operationId: 'createApiKey',
			summary: 'Create an API key',
			description: operationDescription({
				details:
					'Create a new API key for the current project and return the secret exactly once.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.apiKeys.create({
  name: 'primary',
  description: 'Main server key used by production messaging flows.',
  scopes: ['message:write', 'message:read', 'project:logs:read'],
});

if (error) throw error;`),
			security: securityRequirement('project:write'),
			requestBody: jsonBody({
				schema: { $ref: '#/components/schemas/APIKeyCreateBody' },
				example: {
					name: exampleAPIKeyRecord.name,
					description: exampleAPIKeyRecord.description,
					scopes: exampleAPIKeyRecord.scopes,
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/APIKeyCreateResponse',
				example: {
					ok: true,
					data: exampleAPIKeyCreateResult,
				},
			}),
			'x-required-scopes': ['project:write'],
		},
		delete: {
			tags: [tags.apiKeys.name],
			operationId: 'bulkDeleteApiKeys',
			summary: 'Delete API keys in bulk',
			description: operationDescription({
				details: 'Delete between 1 and 20 API keys in a single request.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.apiKeys.sweep({
  ids: ['${exampleSnowflakes.apiKey}'],
});

if (error) throw error;`),
			security: securityRequirement('project:write'),
			requestBody: jsonBody({
				schema: {
					type: 'object',
					required: ['ids'],
					additionalProperties: false,
					properties: {
						ids: {
							type: 'array',
							minItems: 1,
							maxItems: 20,
							uniqueItems: true,
							items: { $ref: '#/components/schemas/Snowflake' },
						},
					},
				},
				example: { ids: [exampleSnowflakes.apiKey] },
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkArrayResponse',
				example: {
					ok: true,
					data: [exampleSnowflakes.apiKey],
				},
			}),
			'x-required-scopes': ['project:write'],
		},
	},
	'/api-keys/{id}': {
		get: {
			tags: [tags.apiKeys.name],
			operationId: 'getApiKey',
			summary: 'Get an API key',
			description: operationDescription({
				details: 'Fetch one API key without exposing its secret.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.apiKeys.get(
  '${exampleSnowflakes.apiKey}',
);

if (error) throw error;`),
			security: securityRequirement('project:api_keys:read'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'API key identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/APIKeyResponse',
				example: {
					ok: true,
					data: exampleAPIKeyRecord,
				},
			}),
			'x-required-scopes': ['project:api_keys:read'],
		},
		patch: {
			tags: [tags.apiKeys.name],
			operationId: 'updateApiKey',
			summary: 'Update an API key',
			description: operationDescription({
				details:
					'Update the display name, description or scopes of an existing API key.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.apiKeys.update(
  '${exampleSnowflakes.apiKey}',
  {
    description: 'Secondary key used by background jobs.',
    scopes: ['message:read', 'project:logs:read'],
  },
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'API key identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			requestBody: jsonBody({
				schema: { $ref: '#/components/schemas/APIKeyUpdateBody' },
				example: {
					description: 'Secondary key used by background jobs.',
					scopes: ['message:read', 'project:logs:read'],
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: { ok: true, data: null },
			}),
			'x-required-scopes': ['project:write'],
		},
		delete: {
			tags: [tags.apiKeys.name],
			operationId: 'deleteApiKey',
			summary: 'Delete an API key',
			description: operationDescription({
				details: 'Permanently delete one API key from the current project.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.apiKeys.delete(
  '${exampleSnowflakes.apiKey}',
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'API key identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: { ok: true, data: null },
			}),
			'x-required-scopes': ['project:write'],
		},
	},
	'/api-keys/{id}/logs': {
		get: {
			tags: [tags.apiKeys.name],
			operationId: 'listApiKeyLogs',
			summary: 'List logs for an API key',
			description: operationDescription({
				details:
					'List request logs filtered to a single API key, with the same query parameters available on the project logs endpoint.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error, cursor } = await rewrite.apiKeys.logs(
  '${exampleSnowflakes.apiKey}',
  {
    status: 200,
    method: 'POST',
    endpoint: '/messages',
  },
);

if (error) throw error;`),
			security: securityRequirement('project:logs:read'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'API key identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
				{ $ref: '#/components/parameters/After' },
				{ $ref: '#/components/parameters/Before' },
				{ $ref: '#/components/parameters/Limit' },
				{ $ref: '#/components/parameters/HTTPStatusCode' },
				{ $ref: '#/components/parameters/LogMethod' },
				{ $ref: '#/components/parameters/LogEndpoint' },
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/RequestLogListResponse',
				example: {
					ok: true,
					data: [exampleRequestLogSummary],
					cursor: exampleCursor,
				},
			}),
			'x-required-scopes': ['project:logs:read'],
		},
	},
};

const contactsPaths = {
	'/contacts': {
		get: {
			tags: [tags.contacts.name],
			operationId: 'listContacts',
			summary: 'List contacts',
			description: operationDescription({
				details:
					'List contacts stored in the current project. Results are paginated with a top-level cursor.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error, cursor } = await rewrite.contacts.list({
  limit: 25,
});

if (error) throw error;`),
			security: securityRequirement('project:read'),
			parameters: [
				{ $ref: '#/components/parameters/After' },
				{ $ref: '#/components/parameters/Before' },
				{ $ref: '#/components/parameters/Limit' },
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/ContactListResponse',
				example: {
					ok: true,
					data: [exampleContactRecord],
					cursor: { persist: false },
				},
			}),
			'x-required-scopes': ['project:read'],
		},
		post: {
			tags: [tags.contacts.name],
			operationId: 'createContact',
			summary: 'Create a contact',
			description: operationDescription({
				details:
					'Create a reusable contact with metadata, tag relations and optional preferred languages.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.contacts.create({
  phone: '+5511999999999',
  name: 'Fernanda',
  channel: 'SMS',
  tags: { flow: 'checkout', origin: 'import' },
  preferredLanguages: ['br', 'us'],
});

if (error) throw error;`),
			security: securityRequirement('project:write'),
			requestBody: jsonBody({
				schema: { $ref: '#/components/schemas/ContactCreateBody' },
				example: {
					phone: exampleContactRecord.phone,
					name: exampleContactRecord.name,
					channel: exampleContactRecord.channel,
					tagIds: [exampleTagRecord.id],
					tags: exampleContactRecord.tags,
					preferredLanguages: exampleContactRecord.preferredLanguages,
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/ContactCreateResponse',
				example: {
					ok: true,
					data: {
						id: exampleContactRecord.id,
						phone: exampleContactRecord.phone,
						country: exampleContactRecord.country,
						createdAt: exampleContactRecord.createdAt,
						sandbox: exampleContactRecord.sandbox,
					},
				},
			}),
			'x-required-scopes': ['project:write'],
		},
		delete: {
			tags: [tags.contacts.name],
			operationId: 'bulkDeleteContacts',
			summary: 'Delete contacts in bulk',
			description: operationDescription({
				details: 'Delete between 1 and 20 contacts in a single request.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.contacts.sweep({
  ids: ['${exampleSnowflakes.contact}'],
});

if (error) throw error;`),
			security: securityRequirement('project:write'),
			requestBody: jsonBody({
				schema: {
					type: 'object',
					required: ['ids'],
					additionalProperties: false,
					properties: {
						ids: {
							type: 'array',
							minItems: 1,
							maxItems: 20,
							uniqueItems: true,
							items: { $ref: '#/components/schemas/Snowflake' },
						},
					},
				},
				example: { ids: [exampleSnowflakes.contact] },
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkArrayResponse',
				example: {
					ok: true,
					data: [exampleSnowflakes.contact],
				},
			}),
			'x-required-scopes': ['project:write'],
		},
	},
	'/contacts/batch': {
		post: {
			tags: [tags.contacts.name],
			operationId: 'batchCreateContacts',
			summary: 'Create contacts in batch',
			description: operationDescription({
				details:
					'Create between 1 and 100 contacts in one request. When `upsert=true`, Rewrite updates matched contacts instead of ignoring them.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.contacts.batch({
  contacts: [
    { phone: '+5511999999999', name: 'Fernanda' },
    { phone: '+5511888888888', name: 'Carlos' },
  ],
  upsert: true,
});

if (error) throw error;`),
			security: securityRequirement('project:write'),
			requestBody: jsonBody({
				schema: {
					type: 'object',
					required: ['contacts'],
					additionalProperties: false,
					properties: {
						contacts: {
							type: 'array',
							minItems: 1,
							maxItems: 100,
							items: { $ref: '#/components/schemas/ContactCreateBody' },
						},
						upsert: {
							type: 'boolean',
						},
					},
				},
				example: {
					contacts: [
						{
							phone: exampleContactRecord.phone,
							name: exampleContactRecord.name,
						},
						{
							phone: '+5511888888888',
							name: 'Carlos',
						},
					],
					upsert: true,
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/ContactBatchResponse',
				example: {
					ok: true,
					data: exampleContactBatchResult,
				},
			}),
			'x-required-scopes': ['project:write'],
		},
	},
	'/contacts/{identifier}': {
		get: {
			tags: [tags.contacts.name],
			operationId: 'getContact',
			summary: 'Get a contact',
			description: operationDescription({
				details:
					'Fetch one contact by its numeric ID or by its saved contact name.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.contacts.get(
  '${exampleSnowflakes.contact}',
);

if (error) throw error;`),
			security: securityRequirement('project:read'),
			parameters: [
				{
					name: 'identifier',
					in: 'path',
					required: true,
					description:
						'Contact identifier. It accepts either a contact ID or a saved contact name.',
					schema: { type: 'string' },
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/ContactResponse',
				example: {
					ok: true,
					data: exampleContactRecord,
				},
			}),
			'x-required-scopes': ['project:read'],
		},
	},
	'/contacts/{id}': {
		patch: {
			tags: [tags.contacts.name],
			operationId: 'updateContact',
			summary: 'Update a contact',
			description: operationDescription({
				details:
					'Update a saved contact, including metadata, preferred languages and attached tags.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.contacts.update(
  '${exampleSnowflakes.contact}',
  {
    name: 'Fernanda Silva',
    preferredLanguages: ['br'],
    tags: { flow: 'otp-login', origin: 'signup' },
  },
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Contact identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			requestBody: jsonBody({
				schema: { $ref: '#/components/schemas/ContactUpdateBody' },
				example: {
					name: 'Fernanda Silva',
					tagIds: [exampleTagRecord.id],
					tags: { flow: 'otp-login', origin: 'signup' },
					preferredLanguages: ['br'],
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: { ok: true, data: null },
			}),
			'x-required-scopes': ['project:write'],
		},
		delete: {
			tags: [tags.contacts.name],
			operationId: 'deleteContact',
			summary: 'Delete a contact',
			description: operationDescription({
				details: 'Permanently delete one saved contact.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.contacts.delete(
  '${exampleSnowflakes.contact}',
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Contact identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: { ok: true, data: null },
			}),
			'x-required-scopes': ['project:write'],
		},
	},
	'/contacts/{id}/tags': {
		post: {
			tags: [tags.contacts.name],
			operationId: 'addTagsToContact',
			summary: 'Attach tags to a contact',
			description: operationDescription({
				details: 'Attach between 1 and 15 existing tags to one contact.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.contacts.addTags(
  '${exampleSnowflakes.contact}',
  { ids: ['${exampleTagRecord.id}'] },
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Contact identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			requestBody: jsonBody({
				schema: { $ref: '#/components/schemas/ContactTagIdsBody' },
				example: { ids: [exampleTagRecord.id] },
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: { ok: true, data: null },
			}),
			'x-required-scopes': ['project:write'],
		},
		delete: {
			tags: [tags.contacts.name],
			operationId: 'removeTagsFromContact',
			summary: 'Detach tags from a contact',
			description: operationDescription({
				details: 'Detach between 1 and 15 existing tags from one contact.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.contacts.removeTags(
  '${exampleSnowflakes.contact}',
  { ids: ['${exampleTagRecord.id}'] },
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Contact identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			requestBody: jsonBody({
				schema: { $ref: '#/components/schemas/ContactTagIdsBody' },
				example: { ids: [exampleTagRecord.id] },
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: { ok: true, data: null },
			}),
			'x-required-scopes': ['project:write'],
		},
	},
};

const segmentsPaths = {
	'/segments': {
		get: {
			tags: [tags.segments.name],
			operationId: 'listSegments',
			summary: 'List segments',
			description: operationDescription({
				details:
					'List segments stored in the current project. Results are paginated with a top-level cursor.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error, cursor } = await rewrite.segments.list({
  limit: 25,
});

if (error) throw error;`),
			security: securityRequirement('project:read'),
			parameters: [
				{ $ref: '#/components/parameters/After' },
				{ $ref: '#/components/parameters/Before' },
				{ $ref: '#/components/parameters/Limit' },
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/SegmentListResponse',
				example: {
					ok: true,
					data: [exampleSegmentRecord],
					cursor: { persist: false },
				},
			}),
			'x-required-scopes': ['project:read'],
		},
		post: {
			tags: [tags.segments.name],
			operationId: 'createSegment',
			summary: 'Create a segment',
			description: operationDescription({
				details: 'Create a reusable contact segment for grouping recipients.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.segments.create({
  name: 'vip-customers',
  description: 'Customers with priority transactional flows.',
  color: '#0EA5E9',
});

if (error) throw error;`),
			security: securityRequirement('project:write'),
			requestBody: jsonBody({
				schema: { $ref: '#/components/schemas/SegmentCreateBody' },
				example: {
					name: exampleSegmentRecord.name,
					description: exampleSegmentRecord.description,
					color: exampleSegmentRecord.color,
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/SegmentCreateResponse',
				example: {
					ok: true,
					data: {
						id: exampleSegmentRecord.id,
						name: exampleSegmentRecord.name,
						description: exampleSegmentRecord.description,
						contactsCount: 0,
						sandbox: exampleSegmentRecord.sandbox,
						updatedAt: exampleSegmentRecord.updatedAt,
						createdAt: exampleSegmentRecord.createdAt,
					},
				},
			}),
			'x-required-scopes': ['project:write'],
		},
		delete: {
			tags: [tags.segments.name],
			operationId: 'bulkDeleteSegments',
			summary: 'Delete segments in bulk',
			description: operationDescription({
				details: 'Delete between 1 and 20 segments in a single request.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.segments.sweep({
  ids: ['${exampleSnowflakes.segment}'],
});

if (error) throw error;`),
			security: securityRequirement('project:write'),
			requestBody: jsonBody({
				schema: {
					type: 'object',
					required: ['ids'],
					additionalProperties: false,
					properties: {
						ids: {
							type: 'array',
							minItems: 1,
							maxItems: 20,
							uniqueItems: true,
							items: { $ref: '#/components/schemas/Snowflake' },
						},
					},
				},
				example: { ids: [exampleSnowflakes.segment] },
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkArrayResponse',
				example: {
					ok: true,
					data: [exampleSnowflakes.segment],
				},
			}),
			'x-required-scopes': ['project:write'],
		},
	},
	'/segments/{id}': {
		get: {
			tags: [tags.segments.name],
			operationId: 'getSegment',
			summary: 'Get a segment',
			description: operationDescription({
				details: 'Fetch one segment and its current aggregate metadata.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.segments.get(
  '${exampleSnowflakes.segment}',
);

if (error) throw error;`),
			security: securityRequirement('project:read'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Segment identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/SegmentResponse',
				example: {
					ok: true,
					data: exampleSegmentRecord,
				},
			}),
			'x-required-scopes': ['project:read'],
		},
		patch: {
			tags: [tags.segments.name],
			operationId: 'updateSegment',
			summary: 'Update a segment',
			description: operationDescription({
				details:
					'Update the name, description or color of an existing segment.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.segments.update(
  '${exampleSnowflakes.segment}',
  {
    description: 'Customers that must always receive high-priority messaging.',
    color: '#2563EB',
  },
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Segment identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			requestBody: jsonBody({
				schema: { $ref: '#/components/schemas/SegmentUpdateBody' },
				example: {
					description:
						'Customers that must always receive high-priority messaging.',
					color: '#2563EB',
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: { ok: true, data: null },
			}),
			'x-required-scopes': ['project:write'],
		},
		delete: {
			tags: [tags.segments.name],
			operationId: 'deleteSegment',
			summary: 'Delete a segment',
			description: operationDescription({
				details: 'Permanently delete one segment from the current project.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.segments.delete(
  '${exampleSnowflakes.segment}',
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Segment identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: { ok: true, data: null },
			}),
			'x-required-scopes': ['project:write'],
		},
	},
	'/segments/{id}/contacts': {
		get: {
			tags: [tags.segments.name],
			operationId: 'listSegmentContacts',
			summary: 'List contacts in a segment',
			description: operationDescription({
				details:
					'List contacts currently attached to one segment. Results are paginated with a top-level cursor.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error, cursor } = await rewrite.segments.contacts(
  '${exampleSnowflakes.segment}',
  { limit: 50 },
);

if (error) throw error;`),
			security: securityRequirement('project:read'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Segment identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
				{ $ref: '#/components/parameters/After' },
				{ $ref: '#/components/parameters/Before' },
				{ $ref: '#/components/parameters/Limit' },
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/ContactListResponse',
				example: {
					ok: true,
					data: [exampleContactRecord],
					cursor: { persist: false },
				},
			}),
			'x-required-scopes': ['project:read'],
		},
		post: {
			tags: [tags.segments.name],
			operationId: 'attachContactToSegment',
			summary: 'Attach one contact to a segment',
			description: operationDescription({
				details: 'Attach a single existing contact to one segment.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.segments.attachContact(
  '${exampleSnowflakes.segment}',
  { contactId: '${exampleSnowflakes.contact}' },
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Segment identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			requestBody: jsonBody({
				schema: { $ref: '#/components/schemas/SegmentAttachContactBody' },
				example: { contactId: exampleContactRecord.id },
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: { ok: true, data: null },
			}),
			'x-required-scopes': ['project:write'],
		},
	},
	'/segments/{id}/contacts/attach': {
		post: {
			tags: [tags.segments.name],
			operationId: 'attachContactsToSegment',
			summary: 'Attach contacts to a segment in bulk',
			description: operationDescription({
				details: 'Attach between 2 and 100 existing contacts to one segment.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.segments.attachContacts(
  '${exampleSnowflakes.segment}',
  { ids: ['${exampleSnowflakes.contact}', '${exampleSnowflakes.contactNext}'] },
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Segment identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			requestBody: jsonBody({
				schema: {
					type: 'object',
					required: ['ids'],
					additionalProperties: false,
					properties: {
						ids: {
							type: 'array',
							minItems: 2,
							maxItems: 100,
							uniqueItems: true,
							items: { $ref: '#/components/schemas/Snowflake' },
						},
					},
				},
				example: {
					ids: [exampleSnowflakes.contact, exampleSnowflakes.contactNext],
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: { ok: true, data: null },
			}),
			'x-required-scopes': ['project:write'],
		},
	},
	'/segments/{id}/contacts/detach': {
		post: {
			tags: [tags.segments.name],
			operationId: 'detachContactsFromSegment',
			summary: 'Detach contacts from a segment in bulk',
			description: operationDescription({
				details: 'Detach between 2 and 100 existing contacts from one segment.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.segments.detachContacts(
  '${exampleSnowflakes.segment}',
  { ids: ['${exampleSnowflakes.contact}', '${exampleSnowflakes.contactNext}'] },
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Segment identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			requestBody: jsonBody({
				schema: {
					type: 'object',
					required: ['ids'],
					additionalProperties: false,
					properties: {
						ids: {
							type: 'array',
							minItems: 2,
							maxItems: 100,
							uniqueItems: true,
							items: { $ref: '#/components/schemas/Snowflake' },
						},
					},
				},
				example: {
					ids: [exampleSnowflakes.contact, exampleSnowflakes.contactNext],
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: { ok: true, data: null },
			}),
			'x-required-scopes': ['project:write'],
		},
	},
	'/segments/{id}/contacts/{contact}': {
		delete: {
			tags: [tags.segments.name],
			operationId: 'detachContactFromSegment',
			summary: 'Detach one contact from a segment',
			description: operationDescription({
				details: 'Detach one existing contact from one segment.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.segments.detachContact(
  '${exampleSnowflakes.segment}',
  '${exampleSnowflakes.contact}',
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Segment identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
				{
					name: 'contact',
					in: 'path',
					required: true,
					description: 'Contact identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: { ok: true, data: null },
			}),
			'x-required-scopes': ['project:write'],
		},
	},
};

const tagPaths = {
	'/tags': {
		get: {
			tags: [tags.tagResources.name],
			operationId: 'listTags',
			summary: 'List tags',
			description: operationDescription({
				details: 'List all reusable tags configured for the current project.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.tags.list();

if (error) throw error;`),
			security: securityRequirement('project:read'),
			responses: okResponse({
				schemaRef: '#/components/schemas/TagListResponse',
				example: {
					ok: true,
					data: [exampleTagRecord],
				},
			}),
			'x-required-scopes': ['project:read'],
		},
		post: {
			tags: [tags.tagResources.name],
			operationId: 'createTag',
			summary: 'Create a tag',
			description: operationDescription({
				details:
					'Create a reusable tag that can later be attached to project contacts.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.tags.create({
  name: 'vip',
  color: '#F97316',
  description: 'Contacts prioritized for transactional messaging.',
});

if (error) throw error;`),
			security: securityRequirement('project:write'),
			requestBody: jsonBody({
				schema: { $ref: '#/components/schemas/TagCreateBody' },
				example: {
					name: exampleTagRecord.name,
					color: exampleTagRecord.color,
					description: exampleTagRecord.description,
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/TagCreateResponse',
				example: {
					ok: true,
					data: {
						id: exampleTagRecord.id,
						slug: 'vip',
						createdAt: exampleTagRecord.createdAt,
					},
				},
			}),
			'x-required-scopes': ['project:write'],
		},
	},
	'/tags/{id}': {
		get: {
			tags: [tags.tagResources.name],
			operationId: 'getTag',
			summary: 'Get a tag',
			description: operationDescription({
				details: 'Fetch one reusable tag by its identifier.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.tags.get(
  '${exampleTagRecord.id}',
);

if (error) throw error;`),
			security: securityRequirement('project:read'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Tag identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/TagResponse',
				example: {
					ok: true,
					data: exampleTagRecord,
				},
			}),
			'x-required-scopes': ['project:read'],
		},
		patch: {
			tags: [tags.tagResources.name],
			operationId: 'updateTag',
			summary: 'Update a tag',
			description: operationDescription({
				details: 'Update the name, description or color of an existing tag.',
			}),
			'x-codeSamples': codeSamples(`const { error } = await rewrite.tags.update(
  '${exampleTagRecord.id}',
  {
    color: '#EA580C',
    description: 'Updated description for priority contacts.',
  },
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Tag identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			requestBody: jsonBody({
				schema: { $ref: '#/components/schemas/TagUpdateBody' },
				example: {
					color: '#EA580C',
					description: 'Updated description for priority contacts.',
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: { ok: true, data: null },
			}),
			'x-required-scopes': ['project:write'],
		},
		delete: {
			tags: [tags.tagResources.name],
			operationId: 'deleteTag',
			summary: 'Delete a tag',
			description: operationDescription({
				details:
					'Permanently delete one reusable tag from the current project.',
			}),
			'x-codeSamples': codeSamples(`const { error } = await rewrite.tags.delete(
  '${exampleTagRecord.id}',
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Tag identifier returned by Rewrite.',
					schema: { $ref: '#/components/schemas/Snowflake' },
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: { ok: true, data: null },
			}),
			'x-required-scopes': ['project:write'],
		},
	},
};

const templatesPaths = {
	'/templates': {
		get: {
			tags: [tags.templates.name],
			operationId: 'listTemplates',
			summary: 'List templates',
			description: operationDescription({
				details:
					'List reusable templates available to the current project. Results are paginated with a top-level cursor.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error, cursor } = await rewrite.templates.list({
  limit: 20,
  withi18n: true,
});

if (error) throw error;`),
			security: securityRequirement('project:templates:read'),
			parameters: [
				{ $ref: '#/components/parameters/After' },
				{ $ref: '#/components/parameters/Before' },
				{ $ref: '#/components/parameters/Limit' },
				{ $ref: '#/components/parameters/WithI18n' },
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/TemplateListResponse',
				example: {
					ok: true,
					data: [exampleTemplateRecord],
					cursor: {
						persist: false,
					},
				},
			}),
			'x-required-scopes': ['project:templates:read'],
		},
		post: {
			tags: [tags.templates.name],
			operationId: 'createTemplate',
			summary: 'Create a template',
			description: operationDescription({
				details:
					'Create a reusable SMS template with variables and optional metadata.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.templates.create({
  name: 'login_code',
  description: 'Template usado no fluxo de login',
  content: 'Rewrite: seu codigo e {{code}}',
  tags: { flow: 'otp', channel: 'login' },
  variables: [{ name: 'code', fallback: '478201' }],
});

if (error) throw error;`),
			security: securityRequirement('project:templates:write'),
			requestBody: jsonBody({
				schema: {
					$ref: '#/components/schemas/TemplateCreateBody',
				},
				example: {
					name: exampleTemplateRecord.name,
					description: exampleTemplateRecord.description,
					content: exampleTemplateRecord.content,
					tags: exampleTemplateRecord.tags,
					variables: exampleTemplateRecord.variables,
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/TemplateCreateResponse',
				example: {
					ok: true,
					data: {
						id: exampleTemplateRecord.id,
						createdAt: exampleTemplateRecord.createdAt,
					},
				},
			}),
			'x-required-scopes': ['project:templates:write'],
		},
		delete: {
			tags: [tags.templates.name],
			operationId: 'bulkDeleteTemplates',
			summary: 'Delete templates in bulk',
			description: operationDescription({
				details: 'Delete between 1 and 20 templates in a single request.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.templates.sweep({
  ids: ['${exampleSnowflakes.template}'],
});

if (error) throw error;`),
			security: securityRequirement('project:templates:write'),
			requestBody: jsonBody({
				schema: {
					type: 'object',
					required: ['ids'],
					additionalProperties: false,
					properties: {
						ids: {
							type: 'array',
							minItems: 1,
							maxItems: 20,
							uniqueItems: true,
							items: {
								$ref: '#/components/schemas/Snowflake',
							},
						},
					},
				},
				example: {
					ids: [exampleSnowflakes.template],
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkArrayResponse',
				example: {
					ok: true,
					data: [exampleSnowflakes.template],
				},
			}),
			'x-required-scopes': ['project:templates:write'],
		},
	},
	'/templates/{identifier}': {
		get: {
			tags: [tags.templates.name],
			operationId: 'getTemplate',
			summary: 'Get a template',
			description: operationDescription({
				details: 'Fetch a single template by its ID or by its name.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.templates.get(
  '${exampleSnowflakes.template}',
);

if (error) throw error;`),
			security: securityRequirement('project:templates:read'),
			parameters: [
				{
					name: 'identifier',
					in: 'path',
					required: true,
					description:
						'Template identifier. It accepts either a template ID or a template name.',
					schema: {
						type: 'string',
					},
				},
				{ $ref: '#/components/parameters/WithI18n' },
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/TemplateResponse',
				example: {
					ok: true,
					data: exampleTemplateRecord,
				},
			}),
			'x-required-scopes': ['project:templates:read'],
		},
	},
	'/templates/{id}': {
		patch: {
			tags: [tags.templates.name],
			operationId: 'updateTemplate',
			summary: 'Update a template',
			description: operationDescription({
				details:
					'Update the content, variables or description of an existing template.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.templates.update(
  '${exampleSnowflakes.template}',
  {
    description: 'Template usado no fluxo de recuperacao de conta',
    content: 'Rewrite: seu codigo e {{code}}',
    tags: { flow: 'otp', channel: 'recovery' },
    variables: [{ name: 'code', fallback: '478201' }],
  },
);

if (error) throw error;`),
			security: securityRequirement('project:templates:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Template identifier returned by Rewrite.',
					schema: {
						$ref: '#/components/schemas/Snowflake',
					},
				},
			],
			requestBody: jsonBody({
				schema: {
					$ref: '#/components/schemas/TemplateUpdateBody',
				},
				example: {
					description: 'Template usado no fluxo de recuperacao de conta',
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: {
					ok: true,
					data: null,
				},
			}),
			'x-required-scopes': ['project:templates:write'],
		},
		delete: {
			tags: [tags.templates.name],
			operationId: 'deleteTemplate',
			summary: 'Delete a template',
			description: operationDescription({
				details:
					'Permanently delete a template that should no longer be used for message rendering.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.templates.delete(
  '${exampleSnowflakes.template}',
);

if (error) throw error;`),
			security: securityRequirement('project:templates:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Template identifier returned by Rewrite.',
					schema: {
						$ref: '#/components/schemas/Snowflake',
					},
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: {
					ok: true,
					data: null,
				},
			}),
			'x-required-scopes': ['project:templates:write'],
		},
	},
	'/templates/{id}/duplicate': {
		post: {
			tags: [tags.templates.name],
			operationId: 'duplicateTemplate',
			summary: 'Duplicate a template',
			description: operationDescription({
				details:
					'Duplicate a template, optionally overriding the generated name.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.templates.duplicate(
  '${exampleSnowflakes.template}',
  { name: 'login_code_copy' },
);

if (error) throw error;`),
			security: securityRequirement('project:templates:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Template identifier returned by Rewrite.',
					schema: {
						$ref: '#/components/schemas/Snowflake',
					},
				},
			],
			requestBody: {
				required: false,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							additionalProperties: false,
							properties: {
								name: {
									type: 'string',
									minLength: 1,
									maxLength: 32,
								},
							},
						},
						example: {
							name: 'login_code_copy',
						},
					},
				},
			},
			responses: okResponse({
				schemaRef: '#/components/schemas/TemplateCreateResponse',
				example: {
					ok: true,
					data: {
						id: exampleSnowflakes.template,
						createdAt: exampleTemplateRecord.createdAt,
					},
				},
			}),
			'x-required-scopes': ['project:templates:write'],
		},
	},
};

const webhooksPaths = {
	'/webhooks': {
		get: {
			tags: [tags.webhooks.name],
			operationId: 'listWebhooks',
			summary: 'List webhooks',
			description: operationDescription({
				details:
					'List webhooks configured for the current project. Results are paginated with a top-level cursor.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error, cursor } = await rewrite.webhooks.list({
  limit: 20,
});

if (error) throw error;`),
			security: securityRequirement('project:webhooks:read'),
			parameters: [
				{ $ref: '#/components/parameters/After' },
				{ $ref: '#/components/parameters/Before' },
				{ $ref: '#/components/parameters/Limit' },
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/WebhookListResponse',
				example: {
					ok: true,
					data: [exampleWebhookRecord],
					cursor: {
						persist: false,
					},
				},
			}),
			'x-required-scopes': ['project:webhooks:read'],
		},
		post: {
			tags: [tags.webhooks.name],
			operationId: 'createWebhook',
			summary: 'Create a webhook',
			description: operationDescription({
				details:
					'Create a webhook and choose which Rewrite events should be delivered to it.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.webhooks.create({
  name: 'delivery-events',
  endpoint: 'https://example.com/rewrite/webhooks',
  events: ['message.sent', 'message.failed', 'sms.otp'],
});

if (error) throw error;`),
			security: securityRequirement('project:webhooks:write'),
			requestBody: jsonBody({
				schema: {
					$ref: '#/components/schemas/WebhookCreateBody',
				},
				example: {
					name: exampleWebhookRecord.name,
					endpoint: exampleWebhookRecord.endpoint,
					events: exampleWebhookRecord.events,
					secret: 'whsec_dGVzdF9zZWNyZXRfdmFsdWU=',
					delivery: {
						timeout: exampleWebhookRecord.timeout,
						retries: exampleWebhookRecord.retries,
					},
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/WebhookCreateResponse',
				example: {
					ok: true,
					data: {
						id: exampleWebhookRecord.id,
						secret: 'whsec_dGVzdF9zZWNyZXRfdmFsdWU=',
						sandbox: false,
						createdAt: exampleWebhookRecord.createdAt,
					},
				},
			}),
			'x-required-scopes': ['project:webhooks:write'],
		},
		delete: {
			tags: [tags.webhooks.name],
			operationId: 'bulkDeleteWebhooks',
			summary: 'Delete webhooks in bulk',
			description: operationDescription({
				details: 'Delete between 1 and 20 webhooks in a single request.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.webhooks.sweep({
  ids: ['${exampleSnowflakes.webhook}'],
});

if (error) throw error;`),
			security: securityRequirement('project:webhooks:write'),
			requestBody: jsonBody({
				schema: {
					type: 'object',
					required: ['ids'],
					additionalProperties: false,
					properties: {
						ids: {
							type: 'array',
							minItems: 1,
							maxItems: 20,
							uniqueItems: true,
							items: {
								$ref: '#/components/schemas/Snowflake',
							},
						},
					},
				},
				example: {
					ids: [exampleSnowflakes.webhook],
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkArrayResponse',
				example: {
					ok: true,
					data: [exampleSnowflakes.webhook],
				},
			}),
			'x-required-scopes': ['project:webhooks:write'],
		},
	},
	'/webhooks/{id}': {
		get: {
			tags: [tags.webhooks.name],
			operationId: 'getWebhook',
			summary: 'Get a webhook',
			description: operationDescription({
				details: 'Fetch one webhook together with its current signing secret.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.webhooks.get(
  '${exampleSnowflakes.webhook}',
);

if (error) throw error;`),
			security: securityRequirement('project:webhooks:read'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Webhook identifier returned by Rewrite.',
					schema: {
						$ref: '#/components/schemas/Snowflake',
					},
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/WebhookResponse',
				example: {
					ok: true,
					data: {
						...exampleWebhookRecord,
						secret: 'whsec_dGVzdF9zZWNyZXRfdmFsdWU=',
					},
				},
			}),
			'x-required-scopes': ['project:webhooks:read'],
		},
		patch: {
			tags: [tags.webhooks.name],
			operationId: 'updateWebhook',
			summary: 'Update a webhook',
			description: operationDescription({
				details:
					'Update an existing webhook, including its event list, URL, enabled flag or signing secret.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.webhooks.update(
  '${exampleSnowflakes.webhook}',
  {
    isEnabled: false,
  },
);

if (error) throw error;`),
			security: securityRequirement('project:webhooks:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Webhook identifier returned by Rewrite.',
					schema: {
						$ref: '#/components/schemas/Snowflake',
					},
				},
			],
			requestBody: jsonBody({
				schema: {
					$ref: '#/components/schemas/WebhookUpdateBody',
				},
				example: {
					isEnabled: false,
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: {
					ok: true,
					data: null,
				},
			}),
			'x-required-scopes': ['project:webhooks:write'],
		},
		delete: {
			tags: [tags.webhooks.name],
			operationId: 'deleteWebhook',
			summary: 'Delete a webhook',
			description: operationDescription({
				details:
					'Permanently delete a webhook and stop future event deliveries to it.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.webhooks.delete(
  '${exampleSnowflakes.webhook}',
);

if (error) throw error;`),
			security: securityRequirement('project:webhooks:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Webhook identifier returned by Rewrite.',
					schema: {
						$ref: '#/components/schemas/Snowflake',
					},
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/OkEmptyResponse',
				example: {
					ok: true,
					data: null,
				},
			}),
			'x-required-scopes': ['project:webhooks:write'],
		},
	},
};

const logsPaths = {
	'/logs': {
		get: {
			tags: [tags.logs.name],
			operationId: 'listRequestLogs',
			summary: 'List request logs',
			description: operationDescription({
				details: 'List API request logs recorded for the current project.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error, cursor } = await rewrite.logs.list({
  method: 'POST',
  endpoint: '/messages',
  status: 200,
  limit: 25,
});

if (error) throw error;`),
			security: securityRequirement('project:logs:read'),
			parameters: [
				{ $ref: '#/components/parameters/After' },
				{ $ref: '#/components/parameters/Before' },
				{ $ref: '#/components/parameters/Limit' },
				{ $ref: '#/components/parameters/HTTPStatusCode' },
				{ $ref: '#/components/parameters/LogMethod' },
				{ $ref: '#/components/parameters/LogEndpoint' },
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/RequestLogListResponse',
				example: {
					ok: true,
					data: [exampleRequestLogSummary],
					cursor: exampleCursor,
				},
			}),
			'x-required-scopes': ['project:logs:read'],
		},
	},
	'/logs/{id}': {
		get: {
			tags: [tags.logs.name],
			operationId: 'getRequestLog',
			summary: 'Get a request log',
			description: operationDescription({
				details:
					'Fetch one API request log together with the stored request and response bodies.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.logs.get(
  '${exampleSnowflakes.log}',
);

if (error) throw error;`),
			security: securityRequirement('project:logs:read'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Webhook delivery log identifier.',
					schema: {
						$ref: '#/components/schemas/Snowflake',
					},
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/RequestLogResponse',
				example: {
					ok: true,
					data: exampleRequestLogDetail,
				},
			}),
			'x-required-scopes': ['project:logs:read'],
		},
	},
};

const deliveriesPaths = {
	'/deliveries': {
		get: {
			tags: [tags.deliveries.name],
			operationId: 'listDeliveries',
			summary: 'List deliveries',
			description: operationDescription({
				details:
					'List compact webhook delivery records across the current project.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error, cursor } = await rewrite.deliveries.list({
  messageId: '${exampleSnowflakes.message}',
  webhookId: '${exampleSnowflakes.webhook}',
  type: 'message.sent',
});

if (error) throw error;`),
			security: securityRequirement('project:logs:read'),
			parameters: [
				{ $ref: '#/components/parameters/After' },
				{ $ref: '#/components/parameters/Before' },
				{ $ref: '#/components/parameters/Limit' },
				{ $ref: '#/components/parameters/WebhookId' },
				{ $ref: '#/components/parameters/MessageId' },
				{
					$ref: '#/components/parameters/WebhookEventTypeRequired',
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/CompactDeliveryListResponse',
				example: {
					ok: true,
					data: [exampleCompactDelivery],
					cursor: exampleCursor,
				},
			}),
			'x-required-scopes': ['project:logs:read'],
		},
	},
	'/deliveries/{id}': {
		get: {
			tags: [tags.deliveries.name],
			operationId: 'getDelivery',
			summary: 'Get a delivery',
			description: operationDescription({
				details:
					'Fetch one webhook delivery attempt together with the exact payload sent by Rewrite.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.deliveries.get(
  '${exampleSnowflakes.log}',
);

if (error) throw error;`),
			security: securityRequirement('project:logs:read'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Delivery identifier returned by Rewrite.',
					schema: {
						$ref: '#/components/schemas/Snowflake',
					},
				},
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/DeliveryResponse',
				example: {
					ok: true,
					data: exampleDeliveryDetail,
				},
			}),
			'x-required-scopes': ['project:logs:read'],
		},
	},
	'/webhooks/{id}/deliveries': {
		get: {
			tags: [tags.deliveries.name],
			operationId: 'listWebhookDeliveries',
			summary: 'List deliveries for a webhook',
			description: operationDescription({
				details:
					'List delivery attempts for one webhook, with filters for event type, HTTP code, delivery status, attempt number and message ID.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error, cursor } = await rewrite.deliveries.byWebhook(
  '${exampleSnowflakes.webhook}',
  {
    type: 'message.sent',
    status: 'SUCCESS',
    limit: 25,
  },
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					description: 'Webhook identifier returned by Rewrite.',
					schema: {
						$ref: '#/components/schemas/Snowflake',
					},
				},
				{ $ref: '#/components/parameters/After' },
				{ $ref: '#/components/parameters/Before' },
				{ $ref: '#/components/parameters/Limit' },
				{
					$ref: '#/components/parameters/WebhookEventTypeRequired',
				},
				{ $ref: '#/components/parameters/WebhookDeliveryStatus' },
				{ $ref: '#/components/parameters/HTTPStatusCode' },
				{ $ref: '#/components/parameters/WebhookAttempt' },
				{ $ref: '#/components/parameters/MessageId' },
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/DeliveryListResponse',
				example: {
					ok: true,
					data: [exampleDeliverySummary],
					cursor: exampleCursor,
				},
			}),
			'x-required-scopes': ['project:write'],
		},
	},
};

const makeSpec = ({ pathMap, tagList }) => ({
	openapi: '3.1.0',
	info,
	servers,
	tags: tagList,
	paths: pathMap,
	components: baseComponents,
});

const mergePaths = (...maps) => Object.assign({}, ...maps);

const specs = {
	'en/api/openapi-messages.json': makeSpec({
		pathMap: messagesOnlyPaths,
		tagList: [tags.messages],
	}),
	'en/api/openapi-api-keys.json': makeSpec({
		pathMap: apiKeysPaths,
		tagList: [tags.apiKeys],
	}),
	'en/api/openapi-contacts.json': makeSpec({
		pathMap: contactsPaths,
		tagList: [tags.contacts],
	}),
	'en/api/openapi-segments.json': makeSpec({
		pathMap: segmentsPaths,
		tagList: [tags.segments],
	}),
	'en/api/openapi-otp.json': makeSpec({
		pathMap: otpPaths,
		tagList: [tags.otp],
	}),
	'en/api/openapi-tags.json': makeSpec({
		pathMap: tagPaths,
		tagList: [tags.tagResources],
	}),
	'en/api/openapi-templates.json': makeSpec({
		pathMap: templatesPaths,
		tagList: [tags.templates],
	}),
	'en/api/openapi-webhooks.json': makeSpec({
		pathMap: webhooksPaths,
		tagList: [tags.webhooks],
	}),
	'en/api/openapi-logs.json': makeSpec({
		pathMap: logsPaths,
		tagList: [tags.logs],
	}),
	'en/api/openapi-deliveries.json': makeSpec({
		pathMap: deliveriesPaths,
		tagList: [tags.deliveries],
	}),
	'en/api/openapi.json': makeSpec({
		pathMap: mergePaths(
			messagesOnlyPaths,
			apiKeysPaths,
			contactsPaths,
			segmentsPaths,
			otpPaths,
			tagPaths,
			templatesPaths,
			webhooksPaths,
			logsPaths,
			deliveriesPaths,
		),
		tagList: [
			tags.messages,
			tags.apiKeys,
			tags.contacts,
			tags.segments,
			tags.otp,
			tags.tagResources,
			tags.templates,
			tags.webhooks,
			tags.logs,
			tags.deliveries,
		],
	}),
};

for (const [rel, spec] of Object.entries(specs)) {
	writeJson(rel, spec);
}

for (const locale of ['pt-br']) {
	for (const file of [
		'openapi-messages.json',
		'openapi-api-keys.json',
		'openapi-contacts.json',
		'openapi-segments.json',
		'openapi-otp.json',
		'openapi-tags.json',
		'openapi-templates.json',
		'openapi-webhooks.json',
		'openapi-logs.json',
		'openapi-deliveries.json',
		'openapi.json',
	]) {
		writeJson(`${locale}/api/${file}`, specs[`en/api/${file}`]);
	}
}

function writeJson(rel, value) {
	const file = join(root, rel);
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, `${JSON.stringify(value, null, '\t')}\n`);
}
