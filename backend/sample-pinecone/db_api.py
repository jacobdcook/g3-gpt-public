from pinecone import Pinecone, ServerlessSpec
from pinecone.core.client.exceptions import NotFoundException
import os
from os.path import join, dirname
from dotenv import load_dotenv


class PinconeAPI:
    api_key = ""  # Set by init_connection()
    pc = None  # Pinecone client

    def __init__(self):
        self.init_connection()

    def init_connection(self):
        load_dotenv(join(dirname(__file__), ".env"))
        self.api_key = os.environ.get("PINECONE_API_KEY")
        self.pc = Pinecone(api_key=self.api_key)

    def get_client(self):
        return self.pc

    def delete(self, index, ids, namespace):
        # For now, just use "test" index
        o_index = self.pc.Index("test")

        o_index.delete(ids=ids, namespace=namespace)

    def check_index(self, index, ns):
        # For now, just use "test" index
        index = self.pc.Index("test")

        for ids in index.list(namespace=str(ns)):
            print(ids)

    def index_exists(self, index: str):
        try:
            self.pc.Index(index)
            return True
        except NotFoundException:
            return False

    def upsert(self, vectors: list, index: str, namespace: str | None = None):
        """
        Add new vectors to the index

        Parameters:
            index: str
            vectors: [{id: str, values: []}]
            namespace: str
        """
        try:
            o_index = self.pc.Index(index)

            o_index.upsert(vectors=vectors, namespace=namespace)
        except NotFoundException:
            print(f"Index {index} does not exist!")
