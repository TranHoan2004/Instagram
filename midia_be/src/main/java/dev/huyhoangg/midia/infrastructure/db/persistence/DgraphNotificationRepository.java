package dev.huyhoangg.midia.infrastructure.db.persistence;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.ByteString;
import dev.huyhoangg.midia.dgraph.processor.DgraphMappingProcessor;
import dev.huyhoangg.midia.dgraph.query.QueryBuilder;
import dev.huyhoangg.midia.dgraph.query.QueryParamType;
import dev.huyhoangg.midia.dgraph.query.QueryParams;
import dev.huyhoangg.midia.domain.model.notification.Notification;
import dev.huyhoangg.midia.domain.repository.notification.NotificationRepository;
import io.dgraph.DgraphProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
@Slf4j
public class DgraphNotificationRepository implements NotificationRepository {
    private final DgraphMappingProcessor mappingProcessor;
    private final DgraphTemplate dgraphTemplate;
    private final ObjectMapper objMapper;

    @Override
    public Notification save(Notification notification) {
        log.info("Saving notification - Pre-save ID: {}, Type: {}", notification.getId(), notification.getType());

        if (notification.getUid() == null || notification.getUid().isBlank()) {
            notification.setUid("_:" + notification.getId());
        }

        var savedNotification = dgraphTemplate.executeMutation(trans -> {
            var jsonReq = mappingProcessor.toDgraphNode(notification);
            log.info("DGraph mutation JSON: {}", jsonReq);
            var jsonMutation = DgraphProto.Mutation.newBuilder()
                    .setSetJson(ByteString.copyFromUtf8(jsonReq))
                    .build();

            var rdfBuilder = new StringBuilder();
            rdfBuilder.append(String.format("<%s> <notification.actor> <%s> .%n", notification.getUid(), notification.getActor().getUid()));
            rdfBuilder.append(String.format("<%s> <notification.recipient> <%s> .%n", notification.getUid(), notification.getRecipient().getUid()));

            if (notification.getPost() != null && notification.getPost().getUid() != null) {
                rdfBuilder.append(String.format("<%s> <notification.post> <%s> .%n", notification.getUid(), notification.getPost().getUid()));
            }

            var rdfMutation = DgraphProto.Mutation.newBuilder()
                    .setSetNquads(ByteString.copyFromUtf8(rdfBuilder.toString()))
                    .build();
            var request = DgraphProto.Request.newBuilder()
                    .addMutations(jsonMutation)
                    .addMutations(rdfMutation)
                    .setCommitNow(true)
                    .build();

            var response = trans.doRequest(request);

            String newUid = response.getUidsMap().get(notification.getId());
            if (newUid != null && !newUid.isBlank()) {
                notification.setUid(newUid);
            }

            return notification;
        });

        log.info("Notification saved - Post-save UID: {}, Type: {}", savedNotification.getUid(), savedNotification.getType());
        return findById(savedNotification.getId()).orElse(savedNotification);
    }

    @Override
    public Optional<Notification> findById(String id) {
        if (id == null || id.trim().isEmpty()) {
            return Optional.empty();
        }

        try {
            var query = QueryBuilder.builder()
                    .queryParams(new QueryParams("$id", QueryParamType.STRING))
                    .forType(Notification.class)
                    .filterEquals("id", "$id")
                    .limit(1)
                    .build();
            return dgraphTemplate.executeReadOnlyQueryReturnOptional(trans -> {
                var vars = Collections.singletonMap("$id", id);
                var resp = trans.queryWithVars(query, vars);
                var result =
                        mappingProcessor.fromDefaultQueryResponse(resp.getJson().toStringUtf8(), Notification.class);
                return result.isEmpty() ? null : result.iterator().next();
            });
        } catch (Exception e) {
            log.error("Error finding notification by id {}: {}", id, e.getMessage(), e);
            return Optional.empty();
        }
    }

    @Override
    public List<Notification> findByRecipientId(String recipientId, int limit, int offset) {
        if (recipientId == null || recipientId.trim().isEmpty()) {
            return new ArrayList<>();
        }

        try {
            String dgraphQuery = String.format(
                    """
                            query find_notifications_by_recipient($recipientId: string) {
                                q(func: type(Notification), first: %d, offset: %d, orderdesc: notification.created_at) @filter(uid_in(notification.recipient, $recipientId)) {
                                    uid
                                    dgraph.type
                                    id
                                    notification.type
                                    notification.message
                                    notification.is_read
                                    notification.created_at
                                    notification.actor {
                                        uid
                                        dgraph.type
                                        id
                                        user.user_name
                                        user.profile {
                                            user_profile.avatar_url
                                        }
                                    }
                                    notification.post {
                                        uid
                                        dgraph.type
                                        id
                                        post.caption
                                        post.visibility
                                    }
                                }
                            }
                            """,
                    Math.max(1, limit), Math.max(0, offset));

            return dgraphTemplate.executeReadOnlyQuery(trans -> {
                var vars = Collections.singletonMap("$recipientId", recipientId);
                var resp = trans.queryWithVars(dgraphQuery, vars);

                log.info(
                        "DGraph raw response for recipient {}: {}",
                        recipientId,
                        resp.getJson().toStringUtf8());

                var result =
                        mappingProcessor.fromDefaultQueryResponse(resp.getJson().toStringUtf8(), Notification.class);

                result.forEach(notification -> {
                    log.info(
                            "Mapped notification - ID: {}, UID: {}, Type: {}",
                            notification.getId(),
                            notification.getUid(),
                            notification.getType());
                });

                return new ArrayList<>(result);
            });
        } catch (Exception e) {
            log.error("Error finding notifications for recipient {}: {}", recipientId, e.getMessage(), e);
            log.error("Stack trace:", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Notification> findUnreadByRecipientId(String recipientId) {
        if (recipientId == null || recipientId.trim().isEmpty()) {
            log.warn("Cannot find unread notifications: recipient ID is null or empty");
            return new ArrayList<>();
        }

        try {
            String dgraphQuery =
                    """
                            query find_unread_notifications($recipientId: string) {
                                q(func: type(Notification), orderdesc: notification.created_at) @filter(uid_in(notification.recipient, $recipientId) AND eq(notification.is_read, false)) {
                                    uid
                                    dgraph.type
                                    id
                                    notification.type
                                    notification.message
                                    notification.is_read
                                    notification.created_at
                                    notification.actor {
                                        uid
                                        dgraph.type
                                        id
                                        user.user_name
                                        user.profile {
                                            user_profile.avatar_url
                                        }
                                    }
                                    notification.post {
                                        uid
                                        dgraph.type
                                        id
                                    }
                                }
                            }
                            """;

            return dgraphTemplate.executeReadOnlyQuery(trans -> {
                var vars = Collections.singletonMap("$recipientId", recipientId);
                var resp = trans.queryWithVars(dgraphQuery, vars);
                var result =
                        mappingProcessor.fromDefaultQueryResponse(resp.getJson().toStringUtf8(), Notification.class);
                return new ArrayList<>(result);
            });
        } catch (Exception e) {
            log.error("Error finding unread notifications for recipient {}: {}", recipientId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    public Long countUnreadByRecipientId(String recipientId) {
        if (recipientId == null || recipientId.trim().isEmpty()) {
            log.warn("Cannot count unread notifications: recipient ID is null or empty");
            return 0L;
        }

        try {
            String dgraphQuery =
                    """
                            query count_unread_notifications($recipientId: string) {
                                q(func: type(Notification)) @filter(uid_in(notification.recipient, $recipientId) AND eq(notification.is_read, false)) {
                                    count(uid)
                                }
                            }
                            """;

            return dgraphTemplate.executeReadOnlyQuery(trans -> {
                var vars = Collections.singletonMap("$recipientId", recipientId);
                var resp = trans.queryWithVars(dgraphQuery, vars);
                var jsonTree = objMapper.readTree(resp.getJson().toStringUtf8());
                var result = jsonTree.get("q");
                if (result.isArray() && result.size() > 0) {
                    return result.get(0).get("count").asLong();
                }
                return 0L;
            });
        } catch (Exception e) {
            log.error("Error counting unread notifications for recipient {}: {}", recipientId, e.getMessage(), e);
            return 0L;
        }
    }

    @Override
    public void markAsRead(String notiId) {
        if (notiId == null || notiId.trim().isEmpty()) {
            log.warn("Cannot mark notification as read: notification ID is null or empty");
            return;
        }

        try {
            dgraphTemplate.executeMutation(trans -> {
                String query =
                        """
                                query find_notification($id: string) {
                                    notification_uid as var(func: eq(id, $id))
                                }
                                """;

                var mutation = DgraphProto.Mutation.newBuilder()
                        .setSetNquads(
                                ByteString.copyFromUtf8("uid(notification_uid) <notification.is_read> \"true\" ."))
                        .setCond("@if(gt(len(notification_uid), 0))")
                        .build();

                var req = DgraphProto.Request.newBuilder()
                        .setQuery(query)
                        .addMutations(mutation)
                        .setCommitNow(true)
                        .putVars("$id", notiId)
                        .build();

                trans.doRequest(req);
            });
            log.debug("Successfully marked notification {} as read", notiId);
        } catch (Exception e) {
            log.error("Error marking notification {} as read: {}", notiId, e.getMessage(), e);
        }
    }

    @Override
    public void markAsReadByRecipientId(String recipientId) {
        if (recipientId == null || recipientId.trim().isEmpty()) {
            log.warn("Cannot mark notifications as read: recipient ID is null or empty");
            return;
        }

        try {
            dgraphTemplate.executeMutation(trans -> {
                String query =
                        """
                                query find_unread_notifications($recipientId: string) {
                                    notification_uids as var(func: type(Notification)) @filter(uid_in(notification.recipient, $recipientId) AND eq(notification.is_read, false))
                                }
                                """;

                var mutation = DgraphProto.Mutation.newBuilder()
                        .setSetNquads(
                                ByteString.copyFromUtf8("uid(notification_uids) <notification.is_read> \"true\" ."))
                        .setCond("@if(gt(len(notification_uids), 0))")
                        .build();

                var req = DgraphProto.Request.newBuilder()
                        .setQuery(query)
                        .addMutations(mutation)
                        .setCommitNow(true)
                        .putVars("$recipientId", recipientId)
                        .build();

                trans.doRequest(req);
            });
            log.debug("Successfully marked all notifications as read for recipient {}", recipientId);
        } catch (Exception e) {
            log.error("Error marking all notifications as read for recipient {}: {}", recipientId, e.getMessage(), e);
        }
    }

    @Override
    public void deleteByActorAndRecipientAndType(String actor, String recipient, String type) {
        dgraphTemplate.executeMutation(trans -> {
            String query =
                    """
                            query find_notification($actorId: string, $recipientId: string, $type: string) {
                                notification_uid as var(func: type(Notification)) @filter(uid_in(notification.actor, $actorId) AND uid_in(notification.recipient, $recipientId) AND eq(notification.type, $type))
                            }
                            """;

            var mutation = DgraphProto.Mutation.newBuilder()
                    .setDelNquads(ByteString.copyFromUtf8("uid(notification_uid) * * ."))
                    .setCond("@if(gt(len(notification_uid), 0))")
                    .build();

            var req = DgraphProto.Request.newBuilder()
                    .setQuery(query)
                    .addMutations(mutation)
                    .setCommitNow(true)
                    .putVars("$actorId", actor)
                    .putVars("$recipientId", recipient)
                    .putVars("$type", type)
                    .build();

            trans.doRequest(req);
        });
    }

    @Override
    public boolean existsByActorAndRecipientAndType(String actorId, String recipientId, String type) {
        if (actorId == null
                || actorId.trim().isEmpty()
                || recipientId == null
                || recipientId.trim().isEmpty()
                || type == null
                || type.trim().isEmpty()) {
            log.warn("Cannot check notification existence: one or more parameters are null or empty");
            return false;
        }

        try {
            String dgraphQuery =
                    """
                            query check_notification_exists($actorId: string, $recipientId: string, $type: string) {
                                actor as var(func: eq(id, $actorId))
                                recipient as var(func: eq(id, $recipientId))
                                q(func: type(Notification)) @filter(uid_in(notification.actor, uid(actor)) AND uid_in(notification.recipient, uid(recipient)) AND eq(notification.type, $type)) {
                                    uid
                                }
                            }
                            """;

            return dgraphTemplate.executeReadOnlyQuery(trans -> {
                var vars = Map.of(
                        "$actorId", actorId,
                        "$recipientId", recipientId,
                        "$type", type);
                var resp = trans.queryWithVars(dgraphQuery, vars);
                var jsonTree = objMapper.readTree(resp.getJson().toStringUtf8());
                var result = jsonTree.get("q");
                return result.isArray() && result.size() > 0;
            });
        } catch (Exception e) {
            log.error(
                    "Error checking notification existence for actor {}, recipient {}, type {}: {}",
                    actorId,
                    recipientId,
                    type,
                    e.getMessage(),
                    e);
            return false;
        }
    }

    @Override
    public List<Notification> findNotificationAfterTimestamp(String recipientId, Instant afterTimestamp) {
        if (recipientId == null || recipientId.trim().isEmpty() || afterTimestamp == null) {
            log.warn("Cannot find notifications after timestamp: recipient ID or timestamp is null or empty");
            return Collections.emptyList();
        }

        try {
            String dgraphQuery =
                    """
                            query find_notifications_after_timestamp($recipientId: string, $timestamp: string) {
                                q(func: type(Notification), orderasc: notification.created_at) @filter(uid_in(notification.recipient, $recipientId) AND gt(notification.created_at, $timestamp)) {
                                    uid
                                    dgraph.type
                                    id
                                    notification.type
                                    notification.message
                                    notification.is_read
                                    notification.created_at
                                    notification.actor {
                                        uid
                                        dgraph.type
                                        id
                                        user.user_name
                                        user.profile {
                                            user_profile.avatar_url
                                        }
                                    }
                                    notification.post {
                                        uid
                                        dgraph.type
                                        id
                                    }
                                }
                            }
                            """;

            return dgraphTemplate.executeReadOnlyQuery(trans -> {
                var vars = Map.of("$recipientId", recipientId, "$timestamp", afterTimestamp.toString());
                var resp = trans.queryWithVars(dgraphQuery, vars);
                var result =
                        mappingProcessor.fromDefaultQueryResponse(resp.getJson().toStringUtf8(), Notification.class);
                return new ArrayList<>(result);
            });
        } catch (Exception e) {
            log.error(
                    "Error finding notifications after timestamp for recipient {}: {}", recipientId, e.getMessage(), e);
            return Collections.emptyList();
        }
    }
}
