import json

import boto3
from botocore.exceptions import ClientError

from app.core.config import settings


def _get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name="us-east-1",
    )


def ensure_bucket():
    """Create the S3 bucket if it doesn't exist."""
    client = _get_s3_client()
    try:
        client.head_bucket(Bucket=settings.S3_BUCKET_NAME)
    except ClientError:
        client.create_bucket(Bucket=settings.S3_BUCKET_NAME)


def upload_tmx(file_bytes: bytes, tm_id: str) -> None:
    client = _get_s3_client()
    client.put_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=f"tm/{tm_id}/original.tmx",
        Body=file_bytes,
        ContentType="application/xml",
    )


def upload_parsed(segments: list[dict], tm_id: str) -> None:
    client = _get_s3_client()
    client.put_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=f"tm/{tm_id}/parsed.json",
        Body=json.dumps(segments, ensure_ascii=False).encode("utf-8"),
        ContentType="application/json",
    )


def get_parsed(tm_id: str) -> list[dict]:
    client = _get_s3_client()
    response = client.get_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=f"tm/{tm_id}/parsed.json",
    )
    return json.loads(response["Body"].read().decode("utf-8"))
