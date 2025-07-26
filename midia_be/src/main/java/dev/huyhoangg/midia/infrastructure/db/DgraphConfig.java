package dev.huyhoangg.midia.infrastructure.db;

import io.dgraph.DgraphAsyncClient;
import io.dgraph.DgraphClient;
import io.dgraph.DgraphGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Profile;

import javax.net.ssl.SSLException;
import java.net.MalformedURLException;

@Configuration
public class DgraphConfig {
    @Value("${dgraph.host}")
    private String host;

    @Value("${dgraph.port}")
    private int port;

    @Bean
    @Lazy
    @Profile("!dev")
    public DgraphClient getDgraphClient() {
        ManagedChannel channel =
                ManagedChannelBuilder.forAddress(host, port).usePlaintext().build();
        DgraphGrpc.DgraphStub stub = DgraphGrpc.newStub(channel);
        return new DgraphClient(stub);
    }

    @Bean
    @Lazy
    @Profile("!dev")
    public DgraphAsyncClient getDgraphAsyncClient() {
        ManagedChannel channel =
                ManagedChannelBuilder.forAddress(host, port).usePlaintext().build();
        DgraphGrpc.DgraphStub stub = DgraphGrpc.newStub(channel);
        return new DgraphAsyncClient(stub);
    }

    @Bean
    @Profile("dev")
    @ConditionalOnProperty(name = {"dgraph.cloud.connection"})
    public DgraphClient getDgraphCloudClient(
            @Value("${dgraph.cloud.connection}") String connection)
            throws SSLException, MalformedURLException {
        return DgraphClient.open(connection);
    }
}
