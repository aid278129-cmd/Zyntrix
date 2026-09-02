import asyncio
import sys
import argparse
from pathlib import Path

# Add repo root to sys.path if not present
repo_root = Path(__file__).resolve().parent.parent.parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from backend.app.database.session import AsyncSessionLocal
from backend.app.services.ingestion.pipeline import ingest_standard_document


async def main_async(args):
    file_path = args.file
    print(f"[Zyntrix BIS Ingestion CLI] Ingesting: {file_path}")

    async with AsyncSessionLocal() as session:
        try:
            summary = await ingest_standard_document(
                db=session,
                file_path=file_path,
                standard_number_override=args.standard,
                standard_title_override=args.title,
                is_verified=not args.unverified,
            )
            print("========================================")
            print("  INGESTION SUCCESSFUL (M1 PIPELINE)")
            print("========================================")
            print(f"Standard:        {summary.standard_number} - {summary.standard_title}")
            print(f"Document ID:     {summary.document_id}")
            print(f"File SHA-256:    {summary.file_hash}")
            print(f"Pages Processed: {summary.total_pages}")
            print(f"Clauses Indexed: {summary.clauses_ingested}")
            print(f"Requirements:    {summary.requirements_ingested}")
            print(f"Trust Status:    {summary.verification_status}")
            print(f"Ingestion State: {summary.ingestion_status}")
            print("========================================")
        except Exception as exc:
            print(f"[ERROR] Ingestion failed: {exc}", file=sys.stderr)
            import traceback
            traceback.print_exc()
            sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Zyntrix BIS Document Ingestion CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    ingest_parser = subparsers.add_parser("ingest", help="Ingest a BIS Standard PDF or Document")
    ingest_parser.add_argument("file", type=str, help="Path to standard PDF file")
    ingest_parser.add_argument("--standard", type=str, default=None, help="Standard number (e.g. IS 17526:2021)")
    ingest_parser.add_argument("--title", type=str, default=None, help="Standard title override")
    ingest_parser.add_argument("--unverified", action="store_true", help="Mark as UNVERIFIED (default is VERIFIED)")

    args = parser.parse_args()
    if args.command == "ingest":
        asyncio.run(main_async(args))


if __name__ == "__main__":
    main()
