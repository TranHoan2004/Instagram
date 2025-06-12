package dev.huyhoangg.midia.infrastructure.db;

import io.dgraph.DgraphAsyncClient;
import io.dgraph.DgraphClient;
import io.dgraph.DgraphGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

@Configuration
public class DgraphConfig {
    @Value("${dgraph.address}")
    private String address;
    @Value("${dgraph.port}")
    private int port;

    @Bean
    @Lazy
    public DgraphClient getDgraphClient() {
        ManagedChannel channel = ManagedChannelBuilder.forAddress(address, port).usePlaintext().build();
        DgraphGrpc.DgraphStub stub = DgraphGrpc.newStub(channel);
        return new DgraphClient(stub);
    }

    @Bean
    @Lazy
    public DgraphAsyncClient getDgraphAsyncClient() {
        ManagedChannel channel = ManagedChannelBuilder.forAddress(address, port).usePlaintext().build();
        DgraphGrpc.DgraphStub stub = DgraphGrpc.newStub(channel);
        return new DgraphAsyncClient(stub);
    }
}
