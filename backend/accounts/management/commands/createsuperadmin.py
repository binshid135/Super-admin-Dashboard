from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from getpass import getpass

CustomUser = get_user_model()

class Command(BaseCommand):
    help = 'Create a superadmin user with superadmin role'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email for the superadmin',
            required=False
        )
        parser.add_argument(
            '--username',
            type=str,
            help='Username for the superadmin',
            required=False
        )
        parser.add_argument(
            '--password',
            type=str,
            help='Password for the superadmin',
            required=False
        )

    def handle(self, *args, **options):
        email = options['email']
        username = options['username']
        password = options['password']

       
        if not email:
            email = input("Enter email: ")
        
        if not username:
            username = input("Enter username: ")
        
        if not password:
            password = getpass("Enter password: ")

        if CustomUser.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'User with email {email} already exists.')
            )
            return

        if CustomUser.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User with username {username} already exists.')
            )
            return

        try:
            # Create superadmin user
            user = CustomUser.objects.create_user(
                email=email,
                username=username,
                password=password,
                role='superadmin'
            )
            
            #Django superuser
            user.is_superuser = True
            user.is_staff = True
            user.save()

            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created superadmin user:\n'
                    f'Email: {email}\n'
                    f'Username: {username}\n'
                    f'Role: {user.role}\n'
                    f'Is Superuser: {user.is_superuser}\n'
                    f'Is Staff: {user.is_staff}'
                )
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superadmin: {str(e)}')
            )