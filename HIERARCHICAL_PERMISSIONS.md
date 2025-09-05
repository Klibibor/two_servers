# Hijerarhijska Permission Struktura - Implementacija

## ✅ Implementirane izmene

### 1. **Hijerarhijska Permission Struktura**

#### `JWTOrSuperuserPermission` (osnovni nivo)
- **Ko može**: JWT grupa članovi + superuseri
- **Šta mogu**: CRUD operacije na ProductViewSet, ProductGroupViewSet
- **Logika**: Superuser automatski nasleđuje sva JWT prava

#### `SuperuserOnlyPermission` (napredni nivo)  
- **Ko može**: Samo superuseri
- **Šta mogu**: Upravljanje korisnicima (create, update, delete)
- **Logika**: Ekskluzivno za superuser operacije

### 2. **Token Claims Prioritet**

Sve permission klase čitaju podatke iz JWT token claims:
```python
token_groups = validated_token.get('groups') or validated_token.payload.get('groups', [])
token_is_superuser = validated_token.get('is_superuser') or validated_token.payload.get('is_superuser', False)
```

**Prednosti**:
- Stateless (brže, bez DB upita)
- Token sadrži: username, is_superuser, groups lista

### 3. **ViewSet Permission Mapiranje**

#### ProductViewSet & ProductGroupViewSet
```python
permission_classes = [JWTOrSuperuserPermission]
```
- JWT korisnici: ✅ mogu CRUD
- Superuseri: ✅ mogu CRUD (nasleđuju JWT prava)

#### KorisnikViewSet (granulirano)
```python
def get_permissions(self):
    if self.action in ['create', 'update', 'partial_update', 'destroy']:
        permission_classes = [SuperuserOnlyPermission]  # Samo superuser
    elif self.action in ['list', 'retrieve']:
        permission_classes = [JWTOrSuperuserPermission]  # JWT + superuser
```

**Rezultat**:
- View korisnika: JWT korisnici + superuseri
- Upravljanje korisnicima: Samo superuseri

### 4. **Token Izdavanje (ostaje isto)**

```python
class APITokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Izdaje token SAMO: JWT grupa članovi + superuseri
        if not (user.groups.filter(name="JWT").exists() or user.is_superuser):
            raise ValidationError("user cant generate token.")
```

## 🎯 Rezultat

### Hijerarhija prava (odozdo naviše):

1. **Anonimni korisnici**: Samo GET/HEAD/OPTIONS (safe methods)
2. **Registrovani korisnici**: Mogu dobiti session auth, ali ne mogu JWT
3. **JWT grupa članovi**: 
   - ✅ Mogu dobiti JWT token
   - ✅ CRUD proizvoda i grupa proizvoda
   - ✅ View korisnika
   - ❌ Upravljanje korisnicima
4. **Superuseri**:
   - ✅ SVE što mogu JWT korisnici (nasleđuju prava)
   - ✅ PLUS: upravljanje korisnicima (create/update/delete)
   - ✅ Mogu dobiti JWT token
   - ✅ Fallback na DB za real-time revocation

### Testovi potvrđuju:
- ✅ JWT korisnici mogu pristupiti JWT-protected resursima
- ✅ Superuseri nasleđuju SVI JWT prava
- ✅ Superuseri imaju ekskluzivan pristup user management-u
- ✅ Regular korisnici su blokirani za JWT operacije
- ✅ Safe methods (GET) su uvek dozvoljeni
- ✅ Permission čita iz token claims (stateless)

**Komanda za test:**
```bash
python -m pytest api/tests/test_hierarchical_permissions.py -v
```
