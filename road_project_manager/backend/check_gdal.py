#!/usr/bin/env python
"""
Check if GDAL is available for Django GIS support.
This script helps determine if PostGIS models can be used.
"""

def check_gdal():
    try:
        from django.contrib.gis.geos import Point
        print("GDAL is available - PostGIS models can be used")
        return True
    except Exception as e:
        print("GDAL not available:", str(e))
        print("\nTo install GDAL:")
        print("Windows: conda install -c conda-forge gdal")
        print("macOS: brew install gdal")
        print("Linux: sudo apt-get install gdal-bin libgdal-dev")
        print("\nAlternative: Use Docker for development")
        return False

if __name__ == "__main__":
    check_gdal()