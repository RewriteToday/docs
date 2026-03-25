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
	'message.scheduled',
];

const webhookStatuses = ['ACTIVE', 'INACTIVE'];
const webhookDeliveryStatuses = ['FAILED', 'SUCCESS'];
const messageTypes = ['SMS', 'OTP'];
const messageEncoding = ['GSM7', 'UCS2'];
const messageAnalysisEncoding = ['gsm7', 'ucs2'];
const messageAnalysisReasons = ['fits', 'smart', 'singleLimit', 'nonGsm7'];

const exampleSnowflakes = {
	message: '748395130237498412',
	messageNext: '748395130237498413',
	messageThird: '748395130237498414',
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

const exampleMessageTag = {
	name: 'flow',
	value: 'login',
};

const exampleMessageInlineBody = {
	to: '+5511999999999',
	content: 'Rewrite: seu codigo e 478201',
	tags: [exampleMessageTag],
	scheduledAt: exampleTimestamps.scheduledAt,
	segmentation: {
		max: 2,
		mode: 'send',
		smart: true,
	},
};

const exampleMessageTemplateBody = {
	to: '+5511888888888',
	templateId: exampleSnowflakes.template,
	variables: {
		code: '941205',
		name: 'Fernanda',
	},
	tags: [exampleMessageTag],
};

const exampleMessageCreateResult = {
	id: exampleSnowflakes.message,
	createdAt: exampleTimestamps.createdAt,
	analysis: exampleMessageAnalysis,
};

const exampleMessageRecord = {
	id: exampleSnowflakes.message,
	createdAt: exampleTimestamps.createdAt,
	to: '+5511999999999',
	from: 'Rewrite',
	type: 'SMS',
	tags: [exampleMessageTag],
	status: 'DELIVERED',
	country: 'br',
	content: 'Rewrite: seu codigo e 478201',
	encoding: 'GSM7',
	templateId: null,
	deliveredAt: exampleTimestamps.deliveredAt,
	scheduledAt: null,
	isPayAsYouGo: false,
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
	description: 'Template usado no fluxo de login',
	createdAt: exampleTimestamps.createdAt,
};

const exampleWebhookRecord = {
	id: exampleSnowflakes.webhook,
	name: 'delivery-events',
	events: ['message.sent', 'message.failed', 'sms.otp'],
	status: 'ACTIVE',
	endpoint: 'https://example.com/rewrite/webhooks',
	createdAt: exampleTimestamps.createdAt,
};

const exampleWebhookEvent = {
	id: exampleSnowflakes.log,
	createdAt: exampleTimestamps.createdAt,
	type: 'message.sent',
	data: {
		id: exampleSnowflakes.message,
		projectId: exampleSnowflakes.project,
		to: '+5511999999999',
		tags: [exampleMessageTag],
		type: 'SMS',
		status: 'SENT',
		content: 'Rewrite: seu codigo e 478201',
		country: 'br',
		analysis: exampleMessageAnalysis,
		error: null,
		deliveredAt: null,
		scheduledAt: null,
		templateId: null,
	},
};

const exampleWebhookLogSummary = {
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
};

const exampleWebhookLogDetail = {
	...exampleWebhookLogSummary,
	payload: exampleWebhookEvent,
	webhookId: exampleSnowflakes.webhook,
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
			required: true,
			description: 'Webhook event type to include in the result set.',
			schema: {
				type: 'string',
				enum: webhookEventTypes,
			},
		},
		WebhookDeliveryStatusRequired: {
			name: 'status',
			in: 'query',
			required: true,
			description: 'Delivery status to include in the result set.',
			schema: {
				type: 'string',
				enum: webhookDeliveryStatuses,
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
		StringArrayDeleteBody: {
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
		DeletedIdsResponse: {
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
				},
				name: {
					type: 'string',
				},
				prefix: {
					type: 'string',
					example: 'rw_d5f3ce',
				},
				scopes: {
					type: 'array',
					items: {
						$ref: '#/components/schemas/AuthScope',
					},
				},
				description: {
					type: ['string', 'null'],
				},
				lastUsedAt: {
					type: ['string', 'null'],
					format: 'date-time',
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
				},
			},
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
		APIKeyCreateBody: {
			type: 'object',
			required: ['name'],
			additionalProperties: false,
			properties: {
				name: {
					type: 'string',
					minLength: 2,
					maxLength: 32,
				},
				description: {
					type: 'string',
					minLength: 1,
					maxLength: 64,
				},
				scopes: {
					type: 'array',
					uniqueItems: true,
					items: {
						$ref: '#/components/schemas/AuthScope',
					},
				},
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
				},
				description: {
					type: ['string', 'null'],
					minLength: 1,
					maxLength: 64,
				},
				scopes: {
					type: 'array',
					uniqueItems: true,
					items: {
						$ref: '#/components/schemas/AuthScope',
					},
				},
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
					example: 'rw_d5f3ce.4pbbWQrluH4SOD5xvR9p9C2x',
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
				},
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
		MessageTag: {
			type: 'object',
			required: ['name', 'value'],
			additionalProperties: false,
			properties: {
				name: {
					type: 'string',
					minLength: 1,
					maxLength: 128,
					description: 'Tag key attached to the message.',
					example: exampleMessageTag.name,
				},
				value: {
					type: 'string',
					minLength: 1,
					maxLength: 128,
					description: 'Tag value attached to the message.',
					example: exampleMessageTag.value,
				},
			},
			example: exampleMessageTag,
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
			title: 'With content',
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
					type: 'array',
					maxItems: 20,
					description: 'Optional metadata stored with the message.',
					items: {
						$ref: '#/components/schemas/MessageTag',
					},
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
		MessageTemplateBody: {
			title: 'Using templates',
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
					type: 'array',
					maxItems: 20,
					description: 'Optional metadata stored with the message.',
					items: {
						$ref: '#/components/schemas/MessageTag',
					},
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
		MessageCreateBody: {
			oneOf: [
				{
					$ref: '#/components/schemas/MessageInlineBody',
				},
				{
					$ref: '#/components/schemas/MessageTemplateBody',
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
					required: ['analysis'],
					additionalProperties: false,
					properties: {
						analysis: {
							$ref: '#/components/schemas/MessageAnalysis',
							description:
								'Segmentation analysis for the SMS content accepted by Rewrite.',
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
				'isPayAsYouGo',
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
					type: 'array',
					description: 'Metadata attached to the message.',
					items: {
						$ref: '#/components/schemas/MessageTag',
					},
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
				isPayAsYouGo: {
					type: 'boolean',
					description:
						'Whether the message consumed pay-as-you-go balance instead of subscription quota.',
					example: exampleMessageRecord.isPayAsYouGo,
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
		OTPCreateBody: {
			type: 'object',
			required: ['to'],
			additionalProperties: false,
			properties: {
				to: {
					type: 'string',
					description: 'Destination number that should receive the OTP.',
					example: '+5511999999999',
				},
				prefix: {
					type: 'string',
					minLength: 1,
					maxLength: 32,
					description: 'Short brand prefix included in the OTP SMS.',
					example: 'Rewrite',
				},
				expiresIn: {
					type: 'integer',
					minimum: 1,
					maximum: 15,
					description: 'Minutes until the OTP expires.',
					example: 5,
				},
			},
			example: {
				to: '+5511999999999',
				prefix: 'Rewrite',
				expiresIn: 5,
			},
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
			required: ['name', 'i18n', 'content', 'variables', 'description'],
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
				i18n: {
					$ref: '#/components/schemas/TemplateI18n',
					description: 'Locale-specific overrides for the template content.',
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
					type: 'string',
					minLength: 1,
					maxLength: 72,
					description:
						'Short human-readable explanation of what the template is for.',
					example: exampleTemplateRecord.description,
				},
			},
			example: {
				name: exampleTemplateRecord.name,
				i18n: exampleTemplateRecord.i18n,
				content: exampleTemplateRecord.content,
				variables: exampleTemplateRecord.variables,
				description: exampleTemplateRecord.description,
			},
		},
		TemplateUpdateBody: {
			type: 'object',
			additionalProperties: false,
			properties: {
				i18n: {
					$ref: '#/components/schemas/TemplateI18n',
					description: 'Locale-specific overrides to replace on the template.',
				},
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
					type: 'string',
					minLength: 1,
					maxLength: 72,
					description: 'Updated human-readable description for the template.',
					example: 'Template usado no fluxo de recuperacao de conta',
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
			},
			example: {
				name: exampleWebhookRecord.name,
				events: exampleWebhookRecord.events,
				secret: 'whsec_dGVzdF9zZWNyZXRfdmFsdWU=',
				endpoint: exampleWebhookRecord.endpoint,
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
				status: {
					type: 'string',
					enum: webhookStatuses,
					description:
						'Whether Rewrite should actively deliver events to this webhook.',
					example: 'INACTIVE',
				},
			},
			example: {
				status: 'INACTIVE',
			},
		},
		Webhook: {
			type: 'object',
			required: ['id', 'name', 'events', 'status', 'endpoint', 'createdAt'],
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
				status: {
					type: 'string',
					enum: webhookStatuses,
					description: 'Current lifecycle status of the webhook.',
					example: exampleWebhookRecord.status,
				},
				endpoint: {
					type: 'string',
					description: 'Destination URL that receives Rewrite webhook events.',
					example: exampleWebhookRecord.endpoint,
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
				'to',
				'tags',
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
				to: {
					type: 'string',
					description: 'Destination number for the message.',
					example: '+5511999999999',
				},
				tags: {
					type: 'array',
					description: 'Metadata attached to the message.',
					items: {
						$ref: '#/components/schemas/MessageTag',
					},
					example: [exampleMessageTag],
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
			required: ['id', 'createdAt', 'type', 'data'],
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
		WebhookLogSummary: {
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
			],
			additionalProperties: false,
			properties: {
				id: {
					$ref: '#/components/schemas/Snowflake',
					description: 'Webhook delivery log identifier.',
					example: exampleWebhookLogSummary.id,
				},
				url: {
					type: 'string',
					description: 'Webhook URL that received the delivery attempt.',
					example: exampleWebhookLogSummary.url,
				},
				type: {
					type: 'string',
					enum: webhookEventTypes,
					description: 'Webhook event type delivered in this attempt.',
					example: exampleWebhookLogSummary.type,
				},
				code: {
					type: ['integer', 'null'],
					description: 'HTTP status code returned by the webhook URL.',
					example: exampleWebhookLogSummary.code,
				},
				error: {
					type: ['string', 'null'],
					description:
						'Transport or application error captured for the attempt.',
					example: exampleWebhookLogSummary.error,
				},
				status: {
					type: 'string',
					enum: webhookDeliveryStatuses,
					description: 'Delivery outcome recorded by Rewrite.',
					example: exampleWebhookLogSummary.status,
				},
				attempt: {
					type: 'integer',
					description: 'Attempt number for this delivery.',
					example: exampleWebhookLogSummary.attempt,
				},
				latency: {
					type: ['integer', 'null'],
					description: 'Round-trip time in milliseconds.',
					example: exampleWebhookLogSummary.latency,
				},
				retryAt: {
					type: ['string', 'null'],
					format: 'date-time',
					description:
						'Next scheduled retry time, when the attempt failed and will retry.',
					example: exampleWebhookLogSummary.retryAt,
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					description: 'Timestamp when Rewrite recorded the delivery attempt.',
					example: exampleWebhookLogSummary.createdAt,
				},
				messageId: {
					type: ['string', 'null'],
					description:
						'Message identifier associated with the delivery attempt, when available.',
					example: exampleWebhookLogSummary.messageId,
				},
			},
			example: exampleWebhookLogSummary,
		},
		WebhookLogDetail: {
			allOf: [
				{
					$ref: '#/components/schemas/WebhookLogSummary',
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
							example: exampleWebhookLogDetail.webhookId,
						},
					},
				},
			],
			example: exampleWebhookLogDetail,
		},
		WebhookLogListResponse: {
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
						$ref: '#/components/schemas/WebhookLogSummary',
					},
				},
				cursor: {
					$ref: '#/components/schemas/Cursor',
				},
			},
			example: {
				ok: true,
				data: [
					exampleWebhookLogSummary,
					{
						...exampleWebhookLogSummary,
						id: exampleSnowflakes.logNext,
						createdAt: exampleTimestamps.deliveredAt,
					},
				],
				cursor: {
					persist: false,
				},
			},
		},
		WebhookLogResponse: {
			type: 'object',
			required: ['ok', 'data'],
			additionalProperties: false,
			properties: {
				ok: {
					type: 'boolean',
					const: true,
				},
				data: {
					$ref: '#/components/schemas/WebhookLogDetail',
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
	apiKeys: {
		name: 'API Keys',
		description: 'Manage API keys exposed through the public API.',
	},
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
		description:
			'Reusable SMS templates with locale-aware content and variables.',
	},
	webhooks: {
		name: 'Webhooks',
		description: 'Create and manage webhooks for Rewrite events.',
	},
	logs: {
		name: 'Logs',
		description: 'Inspect webhook delivery attempts and their payloads.',
	},
};

const apiKeysPaths = {
	'/api-keys/{key}': {
		delete: {
			tags: [tags.apiKeys.name],
			operationId: 'deleteProjectApiKey',
			summary: 'Delete an API key',
			description: operationDescription({
				details:
					'Revoke an API key that should no longer be allowed to call Rewrite.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.apiKeys.delete(
  '${exampleSnowflakes.apiKey}',
);

if (error) throw error;`),
			security: securityRequirement('project:write'),
			parameters: [
				{
					name: 'key',
					in: 'path',
					required: true,
					description: 'API key identifier to revoke.',
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
			'x-required-scopes': ['project:write'],
		},
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
					'Send one SMS with inline content or by rendering a saved template. This route accepts Brazilian destination numbers in `+55` format and returns the accepted message ID immediately.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.messages.send({
  to: '+5511999999999',
  content: 'Rewrite: seu codigo e 478201',
  tags: [{ name: 'flow', value: 'login' }],
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
					usingTemplate: {
						summary: 'Using templates',
						value: exampleMessageTemplateBody,
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
					'Send between 1 and 100 SMS messages in one request. This route accepts Brazilian destination numbers in `+55` format and returns only the accepted message IDs.',
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
						to: '+5511888888888',
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
					'Create and send an OTP SMS to a Brazilian destination number in `+55` format.',
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
				example: {
					to: '+5511999999999',
					prefix: 'Rewrite',
					expiresIn: 5,
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
					'Create a reusable SMS template with variables and optional locale overrides.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error } = await rewrite.templates.create({
  name: 'login_code',
  description: 'Template usado no fluxo de login',
  content: 'Rewrite: seu codigo e {{code}}',
  i18n: { br: 'Rewrite: seu codigo e {{code}}' },
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
					i18n: exampleTemplateRecord.i18n,
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
    name: 'login_code',
    description: 'Template usado no fluxo de recuperacao de conta',
    content: 'Rewrite: seu codigo e {{code}}',
    i18n: { br: 'Rewrite: seu codigo e {{code}}' },
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
				},
			}),
			responses: okResponse({
				schemaRef: '#/components/schemas/WebhookCreateResponse',
				example: {
					ok: true,
					data: {
						id: exampleWebhookRecord.id,
						secret: 'whsec_dGVzdF9zZWNyZXRfdmFsdWU=',
						createdAt: exampleWebhookRecord.createdAt,
					},
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
					'Update an existing webhook, including its event list, URL, status or signing secret.',
			}),
			'x-codeSamples':
				codeSamples(`const { error } = await rewrite.webhooks.update(
  '${exampleSnowflakes.webhook}',
  {
    status: 'INACTIVE',
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
					status: 'INACTIVE',
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
	'/webhooks/{id}/logs': {
		get: {
			tags: [tags.logs.name],
			operationId: 'listWebhookLogs',
			summary: 'List webhook delivery logs',
			description: operationDescription({
				details:
					'List delivery attempts for a specific webhook. Combine `type`, `status` and cursor parameters to inspect a particular delivery flow.',
			}),
			'x-codeSamples':
				codeSamples(`const { data, error, cursor } = await rewrite.logs.list(
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
				{ $ref: '#/components/parameters/WebhookEventTypeRequired' },
				{ $ref: '#/components/parameters/WebhookDeliveryStatusRequired' },
			],
			responses: okResponse({
				schemaRef: '#/components/schemas/WebhookLogListResponse',
				example: {
					ok: true,
					data: [
						exampleWebhookLogSummary,
						{
							...exampleWebhookLogSummary,
							id: exampleSnowflakes.logNext,
							createdAt: exampleTimestamps.deliveredAt,
						},
					],
					cursor: {
						persist: false,
					},
				},
			}),
			'x-required-scopes': ['project:write'],
		},
	},
	'/logs/{id}': {
		get: {
			tags: [tags.logs.name],
			operationId: 'getWebhookLog',
			summary: 'Get a webhook delivery log',
			description: operationDescription({
				details:
					'Fetch one webhook delivery attempt together with the exact event payload delivered by Rewrite.',
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
				schemaRef: '#/components/schemas/WebhookLogResponse',
				example: {
					ok: true,
					data: exampleWebhookLogDetail,
				},
			}),
			'x-required-scopes': ['project:logs:read'],
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
	'en/api/openapi-api-keys.json': makeSpec({
		pathMap: apiKeysPaths,
		tagList: [tags.apiKeys],
	}),
	'en/api/openapi-messages.json': makeSpec({
		pathMap: messagesOnlyPaths,
		tagList: [tags.messages],
	}),
	'en/api/openapi-otp.json': makeSpec({
		pathMap: otpPaths,
		tagList: [tags.otp],
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
	'en/api/openapi.json': makeSpec({
		pathMap: mergePaths(
			apiKeysPaths,
			messagesOnlyPaths,
			otpPaths,
			templatesPaths,
			webhooksPaths,
			logsPaths,
		),
		tagList: [
			tags.apiKeys,
			tags.messages,
			tags.otp,
			tags.templates,
			tags.webhooks,
			tags.logs,
		],
	}),
};

for (const [rel, spec] of Object.entries(specs)) {
	writeJson(rel, spec);
}

for (const locale of ['pt-br']) {
	for (const file of [
		'openapi-api-keys.json',
		'openapi-messages.json',
		'openapi-otp.json',
		'openapi-templates.json',
		'openapi-webhooks.json',
		'openapi-logs.json',
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
