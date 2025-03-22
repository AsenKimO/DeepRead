from pymilvus import MilvusClient


def singleton(cls):
    instances = {}

    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance


@singleton
class VectorDatabase:
    def __init__(self):
        self.client = MilvusClient("milvus.db")

    def create_collection(self, collection_name, dimension):
        if self.client.has_collection(collection_name=collection_name):
            self.delete_collection(collection_name)
        self.client.create_collection(
            collection_name=collection_name,
            dimension=dimension,
        )

    def delete_collection(self, collection_name):
        return self.client.drop_collection(collection_name)

    def insert_vectors(self, collection_name, vectors):
        return self.client.insert(collection_name, vectors)

    def search_vectors(self, collection_name, query_vector, top_k):
        return self.client.search(collection_name, query_vector, top_k)

    def delete_vectors(self, collection_name, ids):
        return self.client.delete(collection_name, ids)
