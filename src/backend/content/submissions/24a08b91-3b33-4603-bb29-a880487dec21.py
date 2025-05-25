import numpy as np


def thomas(A, b):

    n= A.shape[0] #Tamaño de la matriz
    a= [] #Diagonal Inferior
    d= [] #Diagonal
    c= [] #Diagonal Superior
    p= [] #Vector 1
    q = [] #Vector 2

    #Extraccion de diagonales
    for i in range(n):
        if i>0:
            a.append(A[i,i-1])
        d.append(A[i,i])
        if i<n-1:
            c.append(A[i,i+1])

    #Calculos para vectores P y Q
    for j in range(n):
        if j==0:
            p.append(c[0] / d[0])
            q.append(b[0] / d[0])
        else:
            if j < n-1:
                p.append(c[j]/(d[j]-a[j-1]*p[j-1]))
            q.append((b[j] -a[j-1]*q[j-1])/ (d[j]-a[j-1]*p[j-1]))

    #Calculo solucion
    x = np.zeros(n)

    #Calculo Xn=Qn
    x[-1] = q[-1]

    for j in range(n - 2, -1, -1):  # desde n-2 hasta 0
        x[j] = q[j] - p[j] * x[j + 1]

    return x


n = 100
A = np.zeros((n, n))
#Generacion tridiagonal de la matriz
for i in range(n):
    A[i, i] = 5
    if i > 0:
        A[i, i-1] = 1
    if i < n - 1:
        A[i, i+1] = 1
#Generacion b de Ax=b
b = np.full(n, -14)
b[0] = b[-1] = -12

x = thomas(A, b)
print("Solución:", x)












