"""
Authentication views for the fake news detection API.
Provides login, logout, and user profile endpoints.
"""
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.authtoken.models import Token


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Authenticate a user and return an auth token.
    Supports both username and email login.
    """
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    
    # Support both username and email login
    login_identifier = username or email
    
    if not login_identifier or not password:
        return Response(
            {"error": "Email/username and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if the identifier is an email
    if "@" in login_identifier:
        try:
            user_obj = User.objects.get(email=login_identifier)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None
    else:
        # Traditional username login
        user = authenticate(username=login_identifier, password=password)
    
    if user is not None:
        # Get or create token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            }
        })
    else:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout the current user by deleting their auth token.
    """
    try:
        request.user.auth_token.delete()
    except:
        pass
    logout(request)
    return Response({"message": "Logged out successfully"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Get the current user's profile information.
    """
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "date_joined": user.date_joined,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_admin_status(request):
    """
    Check if the current user has admin privileges.
    """
    return Response({
        "is_admin": request.user.is_staff or request.user.is_superuser,
        "username": request.user.username,
    })


@api_view(["POST"])
@permission_classes([IsAdminUser])
def create_admin_user(request):
    """
    Create a new admin user (superuser or staff).
    Only accessible by existing admin users.
    """
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    first_name = request.data.get("first_name", "")
    last_name = request.data.get("last_name", "")
    is_superuser = request.data.get("is_superuser", False)
    
    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = User.objects.create_user(
        username=username,
        email=email or "",
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    user.is_staff = True
    user.is_superuser = is_superuser
    user.save()
    
    return Response({
        "message": "Admin user created successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }
    }, status=status.HTTP_201_CREATED)
